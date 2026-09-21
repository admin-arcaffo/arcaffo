/* eslint-disable @typescript-eslint/no-this-alias -- ES5-compatible embed uses stable instance aliases inside callbacks. */
(function () {
  "use strict";

  var script = document.currentScript;
  if (!script) {
    var scripts = document.querySelectorAll('script[src*="/form.js"]');
    script = scripts[scripts.length - 1] || null;
  }

  // Local, versioned delivery; submissions keep their original Forms destination.
  var apiOrigin = "https://forms.arcaffo.com";
  var selector = "[data-arcaffo-form], [data-dealeto-form]";
  var instanceCount = 0;
  var draftVersion = 1;
  var draftTtlMs = 7 * 24 * 60 * 60 * 1000;
  var autosaveDelayMs = 750;
  var otherOptionId = "__other__";

  function emit(root, name, detail) {
    root.dispatchEvent(
      new CustomEvent("arcaffo:" + name, {
        bubbles: true,
        detail: detail || {},
      })
    );
  }

  function element(tag, attributes, text) {
    var node = document.createElement(tag);
    Object.keys(attributes || {}).forEach(function (key) {
      var value = attributes[key];
      if (value === undefined || value === null || value === false) return;
      if (key === "className") node.className = value;
      else if (key === "htmlFor") node.htmlFor = value;
      else if (key in node && key !== "list") node[key] = value;
      else node.setAttribute(key, value === true ? "" : String(value));
    });
    if (text !== undefined && text !== null) node.textContent = text;
    return node;
  }

  function digits(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function newSubmissionId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") return window.crypto.randomUUID();
    var bytes = new Uint8Array(16);
    window.crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 15) | 64;
    bytes[8] = (bytes[8] & 63) | 128;
    var hex = Array.from(bytes).map(function (byte) { return byte.toString(16).padStart(2, "0"); }).join("");
    return hex.slice(0, 8) + "-" + hex.slice(8, 12) + "-" + hex.slice(12, 16) + "-" + hex.slice(16, 20) + "-" + hex.slice(20);
  }

  function isValidCpf(value) {
    var cpf = digits(value);
    if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
    var sum = 0;
    var index;
    for (index = 0; index < 9; index += 1) sum += Number(cpf[index]) * (10 - index);
    var first = (sum * 10) % 11;
    if (first === 10) first = 0;
    if (first !== Number(cpf[9])) return false;
    sum = 0;
    for (index = 0; index < 10; index += 1) sum += Number(cpf[index]) * (11 - index);
    var second = (sum * 10) % 11;
    if (second === 10) second = 0;
    return second === Number(cpf[10]);
  }

  function isValidCnpj(value) {
    var cnpj = digits(value);
    if (cnpj.length !== 14 || /^(\d)\1{13}$/.test(cnpj)) return false;
    function check(length) {
      var weights = length === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
      var sum = 0;
      for (var i = 0; i < length; i += 1) sum += Number(cnpj[i]) * weights[i];
      var result = sum % 11;
      return (result < 2 ? 0 : 11 - result) === Number(cnpj[length]);
    }
    return check(12) && check(13);
  }

  function comparable(question, value) {
    if (!value) return undefined;
    if (question.type === "nps" || question.type === "scale_0_10" || question.type === "scale_1_5") return value.score;
    if (question.type === "rating") return value.value;
    if (question.type === "multiple_choice") return value.selected;
    if (question.type === "short_text" || question.type === "long_text") return value.text;
    if (question.type === "cep") return value.cep;
    return value.value;
  }

  function branchMatches(question, branch, answer) {
    var current = comparable(question, answer);
    var expected = branch.condition_value;
    if (branch.condition_operator === "is_answered") {
      if (Array.isArray(current)) return current.length > 0;
      return current !== undefined && current !== null && String(current).trim().length > 0;
    }
    if (Array.isArray(current)) {
      var contains = current.indexOf(expected) !== -1;
      if (branch.condition_operator === "equals" || branch.condition_operator === "contains") return contains;
      if (branch.condition_operator === "not_equals") return !contains;
      return false;
    }
    if (typeof current === "number" && typeof expected === "number") {
      if (branch.condition_operator === "equals") return current === expected;
      if (branch.condition_operator === "not_equals") return current !== expected;
      if (branch.condition_operator === "greater_than") return current > expected;
      if (branch.condition_operator === "less_than") return current < expected;
      if (branch.condition_operator === "greater_or_equal") return current >= expected;
      if (branch.condition_operator === "less_or_equal") return current <= expected;
      return false;
    }
    if (typeof current === "string" && typeof expected === "string") {
      if (branch.condition_operator === "equals") return current === expected;
      if (branch.condition_operator === "not_equals") return current !== expected;
      if (branch.condition_operator === "contains") return current.toLowerCase().indexOf(expected.toLowerCase()) !== -1;
    }
    return false;
  }

  function NativeForm(root, documentData) {
    this.root = root;
    this.data = documentData;
    this.questions = documentData.questions.slice().sort(function (a, b) {
      return a.order_index - b.order_index;
    });
    this.branches = documentData.branches;
    this.answers = {};
    this.fields = {};
    this.history = [];
    this.mode = root.getAttribute("data-view") === "step" ? "step" : "all";
    this.instanceId = "arcaffo-form-" + (++instanceCount);
    this.draftKey = "forms-arcaffo:native-draft:v" + draftVersion + ":" + documentData.id;
    this.submissionId = newSubmissionId();
    this.revision = 0;
    this.autosaveTimer = null;
    this.autosaveInFlight = false;
    this.autosavePending = false;
    this.autosaveRetryDelay = 2000;
    this.finalizing = false;
    this.finalized = false;
    this.restoreDraft();
    this.bindRecoveryEvents();
    this.renderStart();
  }

  NativeForm.prototype.restoreDraft = function () {
    try {
      var raw = window.localStorage.getItem(this.draftKey);
      if (!raw) return;
      var draft = JSON.parse(raw);
      if (
        draft.version !== draftVersion ||
        draft.formUpdatedAt !== this.data.updatedAt ||
        typeof draft.savedAt !== "number" ||
        Date.now() - draft.savedAt > draftTtlMs ||
        typeof draft.submissionId !== "string" ||
        !draft.answers ||
        !Array.isArray(draft.history)
      ) {
        window.localStorage.removeItem(this.draftKey);
        return;
      }
      var validIds = new Set(this.questions.map(function (question) { return question.id; }));
      var restoredAnswers = {};
      Object.keys(draft.answers).forEach(function (questionId) {
        if (validIds.has(questionId) && draft.answers[questionId]) restoredAnswers[questionId] = draft.answers[questionId];
      });
      this.answers = restoredAnswers;
      this.history = draft.history.filter(function (questionId) { return validIds.has(questionId); });
      this.submissionId = draft.submissionId;
      this.revision = typeof draft.revision === "number" ? draft.revision : 0;
    } catch {
      // Storage may be unavailable; the in-memory form remains usable.
    }
  };

  NativeForm.prototype.saveDraft = function () {
    try {
      window.localStorage.setItem(this.draftKey, JSON.stringify({
        version: draftVersion,
        formUpdatedAt: this.data.updatedAt,
        submissionId: this.submissionId,
        savedAt: Date.now(),
        answers: this.answers,
        history: this.history,
        revision: this.revision,
      }));
    } catch {
      // Storage may be unavailable; never interrupt the active form.
    }
  };

  NativeForm.prototype.clearDraft = function () {
    try {
      window.localStorage.removeItem(this.draftKey);
    } catch {
      // A completed server commit is authoritative even if cleanup is blocked.
    }
  };

  NativeForm.prototype.responseEndpoint = function () {
    return apiOrigin + "/api/public/forms/" + encodeURIComponent(this.data.id) +
      "/responses/" + encodeURIComponent(this.submissionId);
  };

  NativeForm.prototype.bindRecoveryEvents = function () {
    var self = this;
    this.handleOnline = function () {
      if (self.autosavePending) self.flushAutosave(false);
    };
    this.handlePageHide = function () {
      self.autosavePending = true;
      self.flushAutosave(true);
    };
    window.addEventListener("online", this.handleOnline);
    window.addEventListener("pagehide", this.handlePageHide);
  };

  NativeForm.prototype.unbindRecoveryEvents = function () {
    window.removeEventListener("online", this.handleOnline);
    window.removeEventListener("pagehide", this.handlePageHide);
  };

  NativeForm.prototype.queueAutosave = function (immediate) {
    var self = this;
    if (
      this.data.settings.capture_partial_responses === false ||
      this.finalizing ||
      this.finalized ||
      Object.keys(this.answers).length === 0
    ) return;

    this.autosavePending = true;
    if (this.autosaveTimer) window.clearTimeout(this.autosaveTimer);
    this.autosaveTimer = window.setTimeout(function () {
      self.flushAutosave(false);
    }, immediate ? 0 : autosaveDelayMs);
  };

  NativeForm.prototype.flushAutosave = function (keepalive) {
    var self = this;
    if (
      this.data.settings.capture_partial_responses === false ||
      this.finalizing ||
      this.finalized ||
      !this.autosavePending ||
      Object.keys(this.answers).length === 0 ||
      (this.autosaveInFlight && !keepalive)
    ) return;

    if (!keepalive) {
      this.autosaveInFlight = true;
      this.autosavePending = false;
    }
    var revision = this.revision + 1;
    this.revision = revision;
    var answers = Object.keys(this.answers).map(function (questionId) {
      return { questionId: questionId, value: self.answers[questionId] };
    });

    fetch(this.responseEndpoint(), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      keepalive: Boolean(keepalive),
      body: JSON.stringify({
        revision: revision,
        answers: answers,
        currentQuestionId: this.mode === "step" ? this.history[this.history.length - 1] || null : null,
        website: this.honeypot ? this.honeypot.value : "",
        pageUrl: window.location.href,
        isEmbed: true,
      }),
    })
      .then(function (response) {
        return response.json().then(function (body) {
          if (!response.ok || !body.ok) throw new Error("Autosave rejected");
          return body;
        });
      })
      .then(function (result) {
        var serverRevision = typeof result.revision === "number" ? result.revision : null;
        if (serverRevision !== null && serverRevision > self.revision) self.revision = serverRevision;
        if (result.applied === false && serverRevision !== null && serverRevision > revision) {
          self.autosavePending = true;
        }
        self.autosaveRetryDelay = 2000;
        self.saveDraft();
      })
      .catch(function () {
        self.autosavePending = true;
        self.autosaveRetryDelay = Math.min(self.autosaveRetryDelay * 2, 30000);
      })
      .finally(function () {
        if (keepalive) return;
        self.autosaveInFlight = false;
        if (self.autosavePending && navigator.onLine) {
          self.autosaveTimer = window.setTimeout(function () {
            self.flushAutosave(false);
          }, self.autosaveRetryDelay);
        }
      });
  };

  NativeForm.prototype.nextId = function (question, answer) {
    var matches = this.branches
      .filter(function (branch) {
        return branch.question_id === question.id;
      })
      .sort(function (a, b) {
        return a.priority - b.priority;
      });
    for (var i = 0; i < matches.length; i += 1) {
      if (branchMatches(question, matches[i], answer)) return matches[i].target_question_id;
    }
    var currentIndex = this.questions.findIndex(function (item) {
      return item.id === question.id;
    });
    return this.questions[currentIndex + 1] ? this.questions[currentIndex + 1].id : null;
  };

  NativeForm.prototype.visibleQuestions = function () {
    var visible = [];
    var visited = {};
    var current = this.questions[0] || null;
    while (current && !visited[current.id]) {
      visited[current.id] = true;
      visible.push(current);
      var next = this.nextId(current, this.answers[current.id]);
      current = next
        ? this.questions.find(function (question) {
            return question.id === next;
          }) || null
        : null;
    }
    return visible;
  };

  NativeForm.prototype.renderStart = function () {
    this.root.replaceChildren();
    this.root.setAttribute("data-arcaffo-ready", "");
    this.root.classList.add("arcaffo-embed");

    if (Object.keys(this.answers).length > 0) {
      this.renderForm();
      emit(this.root, "ready", { formId: this.data.id, mode: this.mode, draftRestored: true });
      return;
    }

    var welcome = this.data.welcome || {};
    if (welcome.enabled) {
      var section = element("section", {
        className: "arcaffo-welcome",
        "data-arcaffo-screen": "welcome",
        "aria-labelledby": this.instanceId + "-welcome-title",
      });
      section.appendChild(
        element("h2", { id: this.instanceId + "-welcome-title" }, welcome.title || this.data.title)
      );
      if (welcome.description) section.appendChild(element("p", {}, welcome.description));
      var start = element("button", { type: "button" }, welcome.button_label || "Começar");
      start.addEventListener("click", this.renderForm.bind(this));
      section.appendChild(start);
      this.root.appendChild(section);
    } else {
      this.renderForm();
    }
    emit(this.root, "ready", { formId: this.data.id, mode: this.mode });
  };

  NativeForm.prototype.renderField = function (question, index) {
    var fieldset = element("fieldset", {
      className: "arcaffo-field",
      "data-arcaffo-field": question.id,
      "data-question-type": question.type,
    });
    var legend = element("legend", { id: this.instanceId + "-legend-" + question.id }, question.title);
    if (question.is_required) {
      legend.appendChild(element("span", { "aria-hidden": "true", className: "arcaffo-required" }, " *"));
    }
    fieldset.appendChild(legend);

    var descriptionId = this.instanceId + "-description-" + question.id;
    if (question.description) {
      fieldset.appendChild(element("p", { id: descriptionId, className: "arcaffo-description" }, question.description));
    }
    var control = element("div", { className: "arcaffo-control" });
    this.appendQuestionControl(control, question, index, descriptionId);
    // The legend labels the group; text controls also need their own accessible name.
    control.querySelectorAll('input:not([type="radio"]):not([type="checkbox"]), textarea, select').forEach(function (input) {
      if (!input.getAttribute("aria-label") && !input.getAttribute("aria-labelledby")) {
        input.setAttribute("aria-labelledby", legend.id);
      }
    });
    fieldset.appendChild(control);
    var errorId = this.instanceId + "-error-" + question.id;
    fieldset.appendChild(element("p", { id: errorId, className: "arcaffo-error", role: "alert", hidden: true }));
    this.fields[question.id] = fieldset;
    return fieldset;
  };

  NativeForm.prototype.inputAttributes = function (question, suffix, descriptionId) {
    return {
      id: this.instanceId + "-" + question.id + (suffix ? "-" + suffix : ""),
      name: this.instanceId + "-" + question.id,
      required: question.is_required,
      "aria-describedby":
        (question.description ? descriptionId + " " : "") + this.instanceId + "-error-" + question.id,
    };
  };

  NativeForm.prototype.appendQuestionControl = function (control, question, index, descriptionId) {
    var self = this;
    var config = question.config || {};
    var attributes;
    var input;

    function onChange() {
      self.answers[question.id] = self.readAnswer(question);
      self.clearError(question);
      if (self.mode === "all") self.syncVisibleFields();
      self.saveDraft();
      self.queueAutosave(["nps", "scale_0_10", "scale_1_5", "rating", "multiple_choice"].indexOf(question.type) !== -1);
    }

    if (question.type === "nps" || question.type === "scale_0_10") {
      var npsGroup = element("div", { className: "arcaffo-options arcaffo-nps" });
      for (var score = 0; score <= 10; score += 1) {
        attributes = self.inputAttributes(question, String(score), descriptionId);
        input = element("input", Object.assign(attributes, { type: "radio", value: String(score) }));
        input.addEventListener("change", onChange);
        var npsLabel = element("label", { htmlFor: input.id });
        npsLabel.appendChild(input);
        npsLabel.appendChild(document.createTextNode(String(score)));
        npsGroup.appendChild(npsLabel);
      }
      control.appendChild(npsGroup);
      if (config.minLabel || config.maxLabel) {
        var scale = element("div", { className: "arcaffo-scale-labels" });
        scale.appendChild(element("span", {}, config.minLabel || ""));
        scale.appendChild(element("span", {}, config.maxLabel || ""));
        control.appendChild(scale);
      }
      return;
    }

    if (question.type === "scale_1_5") {
      var scaleGroup = element("div", { className: "arcaffo-options arcaffo-scale-1-5", role: "radiogroup", "aria-label": "Escala de 1 a 5" });
      for (var scaleScore = 1; scaleScore <= 5; scaleScore += 1) {
        attributes = self.inputAttributes(question, String(scaleScore), descriptionId);
        input = element("input", Object.assign(attributes, { type: "radio", value: String(scaleScore) }));
        input.addEventListener("change", onChange);
        var scaleLabel = element("label", { htmlFor: input.id });
        scaleLabel.appendChild(input);
        scaleLabel.appendChild(document.createTextNode(String(scaleScore)));
        scaleGroup.appendChild(scaleLabel);
      }
      control.appendChild(scaleGroup);
      if (config.minLabel || config.maxLabel) {
        var scaleLabels = element("div", { className: "arcaffo-scale-labels" });
        scaleLabels.appendChild(element("span", {}, config.minLabel || ""));
        scaleLabels.appendChild(element("span", {}, config.maxLabel || ""));
        control.appendChild(scaleLabels);
      }
      return;
    }

    if (question.type === "rating") {
      var rating = element("div", { className: "arcaffo-options arcaffo-rating" });
      for (var value = 1; value <= Number(config.max || 5); value += 1) {
        attributes = self.inputAttributes(question, String(value), descriptionId);
        input = element("input", Object.assign(attributes, { type: "radio", value: String(value) }));
        input.addEventListener("change", onChange);
        var ratingLabel = element("label", { htmlFor: input.id });
        ratingLabel.appendChild(input);
        ratingLabel.appendChild(document.createTextNode(String(value)));
        rating.appendChild(ratingLabel);
      }
      control.appendChild(rating);
      return;
    }

    if (question.type === "multiple_choice") {
      var choices = element("div", { className: "arcaffo-options arcaffo-choices" });
      var otherInput = null;
      var otherTextInput = null;
      var otherTextWrap = null;

      function setOtherVisibility(focus) {
        if (!otherTextWrap || !otherTextInput || !otherInput) return;
        otherTextWrap.hidden = !otherInput.checked;
        otherTextInput.disabled = !otherInput.checked;
        if (!otherInput.checked) otherTextInput.value = "";
        else if (focus) otherTextInput.focus();
      }

      (config.options || []).forEach(function (option, optionIndex) {
        attributes = self.inputAttributes(question, String(optionIndex), descriptionId);
        input = element("input", Object.assign(attributes, {
          type: config.allowMultiple ? "checkbox" : "radio",
          value: option.id,
          required: question.is_required && !config.allowMultiple,
        }));
        input.addEventListener("change", function () {
          if (this.checked && otherInput) {
            otherInput.checked = false;
            setOtherVisibility(false);
          }
          onChange();
        });
        var choiceLabel = element("label", { htmlFor: input.id });
        choiceLabel.appendChild(input);
        choiceLabel.appendChild(document.createTextNode(option.label));
        choices.appendChild(choiceLabel);
      });

      if (config.otherOption) {
        attributes = self.inputAttributes(question, "other", descriptionId);
        otherInput = element("input", Object.assign(attributes, {
          type: config.allowMultiple ? "checkbox" : "radio",
          value: otherOptionId,
          required: question.is_required && !config.allowMultiple,
          "data-other-option": "true",
        }));
        var otherLabel = element("label", { htmlFor: otherInput.id });
        otherLabel.appendChild(otherInput);
        otherLabel.appendChild(document.createTextNode("Outro"));
        choices.appendChild(otherLabel);

        otherTextInput = element("input", {
          id: self.instanceId + "-" + question.id + "-other-text",
          name: self.instanceId + "-" + question.id + "-other-text",
          type: "text",
          placeholder: "Especifique sua resposta",
          "aria-label": "Especifique a resposta em Outro",
          "aria-describedby": (question.description ? descriptionId + " " : "") + self.instanceId + "-error-" + question.id,
          "data-other-text": "true",
          disabled: true,
        });
        otherTextWrap = element("div", { className: "arcaffo-other-text", hidden: true });
        otherTextWrap.appendChild(otherTextInput);
        choices.appendChild(otherTextWrap);

        otherInput.addEventListener("change", function () {
          if (otherInput.checked) {
            choices.querySelectorAll('input[type="radio"], input[type="checkbox"]').forEach(function (choice) {
              if (choice !== otherInput) choice.checked = false;
            });
          }
          setOtherVisibility(otherInput.checked);
          onChange();
        });
        otherTextInput.addEventListener("input", onChange);
      }
      control.appendChild(choices);
      return;
    }

    attributes = self.inputAttributes(question, "input", descriptionId);
    var common = {
      placeholder: config.placeholder || "",
      maxLength: config.maxLength || undefined,
      autoComplete: "off",
    };

    if (question.type === "long_text") {
      input = element("textarea", Object.assign(attributes, common, { rows: 4 }));
    } else {
      var type = question.type === "email" ? "email" : question.type === "phone" ? "tel" : "text";
      var inputMode = ["cpf", "cnpj", "cep", "phone"].indexOf(question.type) !== -1 ? "numeric" : undefined;
      input = element("input", Object.assign(attributes, common, { type: type, inputMode: inputMode }));
    }
    input.addEventListener("input", onChange);
    control.appendChild(input);

    if (question.type === "cep") {
      input.setAttribute("autocomplete", "postal-code");
      input.addEventListener("input", function () {
        if (digits(input.value).length === 8) self.lookupCep(question, input.value);
      });
      var address = element("div", { className: "arcaffo-address", hidden: true });
      ["street", "neighborhood", "city", "state"].forEach(function (key) {
        var addressInput = element("input", {
          type: "text",
          name: self.instanceId + "-" + question.id + "-" + key,
          "data-address-field": key,
          readOnly: true,
          tabIndex: -1,
        });
        address.appendChild(addressInput);
      });
      control.appendChild(address);
    }
  };

  NativeForm.prototype.lookupCep = function (question, rawCep) {
    var self = this;
    var cep = digits(rawCep);
    fetch("https://viacep.com.br/ws/" + cep + "/json/")
      .then(function (response) {
        if (!response.ok) throw new Error("CEP lookup failed");
        return response.json();
      })
      .then(function (address) {
        if (address.erro) return;
        var field = self.fields[question.id];
        var values = {
          street: address.logradouro || "",
          neighborhood: address.bairro || "",
          city: address.localidade || "",
          state: address.uf || "",
        };
        Object.keys(values).forEach(function (key) {
          var target = field.querySelector('[data-address-field="' + key + '"]');
          if (target) target.value = values[key];
        });
        var addressGroup = field.querySelector(".arcaffo-address");
        if (addressGroup) addressGroup.hidden = false;
        self.answers[question.id] = self.readAnswer(question);
        self.saveDraft();
        self.queueAutosave(false);
      })
      .catch(function () {
        // Address completion is an enhancement; a valid CEP remains submittable.
      });
  };

  NativeForm.prototype.readAnswer = function (question) {
    var field = this.fields[question.id];
    if (!field) return null;
    if (question.type === "nps" || question.type === "scale_0_10" || question.type === "scale_1_5") {
      var nps = field.querySelector('input[type="radio"]:checked');
      return nps ? { score: Number(nps.value) } : null;
    }
    if (question.type === "rating") {
      var rating = field.querySelector('input[type="radio"]:checked');
      return rating ? { value: Number(rating.value) } : null;
    }
    if (question.type === "multiple_choice") {
      var selected = Array.from(field.querySelectorAll("input:checked")).map(function (item) {
        return item.value;
      });
      if (!selected.length) return null;
      if (selected.indexOf(otherOptionId) !== -1) {
        var otherText = field.querySelector("[data-other-text]");
        return { selected: [otherOptionId], otherText: otherText ? otherText.value.trim() : "" };
      }
      return { selected: selected };
    }
    var input = field.querySelector("input, textarea");
    var raw = input ? input.value.trim() : "";
    if (!raw) return null;
    if (question.type === "short_text" || question.type === "long_text") return { text: raw };
    if (question.type === "cep") {
      var answer = { cep: digits(raw) };
      field.querySelectorAll("[data-address-field]").forEach(function (addressInput) {
        if (addressInput.value) answer[addressInput.getAttribute("data-address-field")] = addressInput.value;
      });
      return answer;
    }
    return { value: question.type === "email" ? raw : digits(raw) };
  };

  NativeForm.prototype.validateQuestion = function (question) {
    var answer = this.readAnswer(question);
    this.answers[question.id] = answer;
    var message = "";
    if (!answer && question.is_required) message = "Resposta obrigatória.";
    else if (answer && question.type === "cpf" && !isValidCpf(answer.value)) message = "CPF inválido.";
    else if (answer && question.type === "cnpj" && !isValidCnpj(answer.value)) message = "CNPJ inválido.";
    else if (answer && question.type === "cep" && answer.cep.length !== 8) message = "CEP inválido.";
    else if (answer && question.type === "phone" && (answer.value.length < 10 || answer.value.length > 11)) message = "Telefone inválido.";
    else if (answer && question.type === "email") {
      var emailInput = this.fields[question.id].querySelector('input[type="email"]');
      if (emailInput && !emailInput.validity.valid) message = "E-mail inválido.";
    }
    if (answer && question.type === "multiple_choice" && !question.config.allowMultiple && answer.selected.length > 1) {
      message = "Selecione apenas uma opção.";
    }
    if (
      answer &&
      question.type === "multiple_choice" &&
      answer.selected.indexOf(otherOptionId) !== -1 &&
      !String(answer.otherText || "").trim()
    ) {
      message = "Especifique a resposta em Outro.";
    }
    this.setError(question, message);
    return !message;
  };

  NativeForm.prototype.setError = function (question, message) {
    var field = this.fields[question.id];
    if (!field) return;
    var error = field.querySelector(".arcaffo-error");
    if (error) {
      error.textContent = message;
      error.hidden = !message;
    }
    field.toggleAttribute("data-invalid", Boolean(message));
    field.querySelectorAll("input, textarea").forEach(function (control) {
      control.setAttribute("aria-invalid", message ? "true" : "false");
    });
  };

  NativeForm.prototype.clearError = function (question) {
    this.setError(question, "");
  };

  NativeForm.prototype.restoreControls = function () {
    var self = this;
    this.questions.forEach(function (question) {
      var answer = self.answers[question.id];
      var field = self.fields[question.id];
      if (!answer || !field) return;

      if (question.type === "nps" || question.type === "scale_0_10" || question.type === "scale_1_5") {
        var nps = field.querySelector('input[type="radio"][value="' + answer.score + '"]');
        if (nps) nps.checked = true;
        return;
      }
      if (question.type === "rating") {
        var rating = field.querySelector('input[type="radio"][value="' + answer.value + '"]');
        if (rating) rating.checked = true;
        return;
      }
      if (question.type === "multiple_choice") {
        (answer.selected || []).forEach(function (value) {
          var option = Array.from(field.querySelectorAll("input")).find(function (input) { return input.value === value; });
          if (option) option.checked = true;
        });
        var otherText = field.querySelector("[data-other-text]");
        var otherWrap = otherText ? otherText.parentElement : null;
        var hasOther = (answer.selected || []).indexOf(otherOptionId) !== -1;
        if (otherText) {
          otherText.value = hasOther ? answer.otherText || "" : "";
          otherText.disabled = !hasOther;
        }
        if (otherWrap) otherWrap.hidden = !hasOther;
        return;
      }

      var input = field.querySelector("input, textarea");
      if (!input) return;
      if (question.type === "short_text" || question.type === "long_text") input.value = answer.text || "";
      else if (question.type === "cep") {
        input.value = answer.cep || "";
        ["street", "neighborhood", "city", "state"].forEach(function (key) {
          var addressInput = field.querySelector('[data-address-field="' + key + '"]');
          if (addressInput && answer[key]) addressInput.value = answer[key];
        });
        var addressGroup = field.querySelector(".arcaffo-address");
        if (addressGroup) addressGroup.hidden = !answer.street && !answer.city && !answer.state;
      } else input.value = answer.value || "";
    });
  };

  NativeForm.prototype.syncVisibleFields = function () {
    var visible = this.visibleQuestions();
    var visibleIds = new Set(
      visible.map(function (question) {
        return question.id;
      })
    );
    var self = this;
    this.questions.forEach(function (question) {
      var field = self.fields[question.id];
      var shown = visibleIds.has(question.id);
      field.hidden = !shown;
      field.querySelectorAll("input, textarea, button, select").forEach(function (control) {
        control.disabled = !shown;
      });
      if (!shown) {
        delete self.answers[question.id];
        self.clearError(question);
      }
    });
  };

  NativeForm.prototype.renderForm = function () {
    var self = this;
    this.root.replaceChildren();
    this.fields = {};
    var form = element("form", {
      className: "arcaffo-form",
      "data-arcaffo-screen": "form",
      noValidate: true,
    });
    form.appendChild(element("h2", { className: "arcaffo-title" }, this.data.title));

    if (this.mode === "step" && this.data.settings.show_progress_bar !== false) {
      this.progress = element("progress", { className: "arcaffo-progress", max: this.questions.length, value: 1 });
      this.progress.appendChild(document.createTextNode("1 de " + this.questions.length));
      form.appendChild(this.progress);
    }

    var fields = element("div", { className: "arcaffo-fields" });
    this.questions.forEach(function (question, index) {
      fields.appendChild(self.renderField(question, index));
    });
    form.appendChild(fields);

    var honeypot = element("div", { hidden: true, "aria-hidden": "true" });
    var honeypotInput = element("input", { type: "text", name: "website", tabIndex: -1, autoComplete: "off" });
    honeypot.appendChild(element("label", {}, "Website"));
    honeypot.appendChild(honeypotInput);
    form.appendChild(honeypot);
    this.honeypot = honeypotInput;

    this.actions = element("div", { className: "arcaffo-actions" });
    if (this.mode === "step") {
      this.backButton = element("button", { type: "button", disabled: true }, "Voltar");
      this.backButton.addEventListener("click", function () {
        if (self.history.length <= 1) return;
        self.history.pop();
        self.saveDraft();
        self.showStep(self.history[self.history.length - 1]);
      });
      this.actions.appendChild(this.backButton);
      this.submitButton = element("button", { type: "submit" }, "Avançar");
      this.actions.appendChild(this.submitButton);
    } else {
      this.submitButton = element("button", { type: "submit" }, "Enviar");
      this.actions.appendChild(this.submitButton);
    }
    form.appendChild(this.actions);
    this.status = element("p", { className: "arcaffo-status", role: "status", "aria-live": "polite" });
    form.appendChild(this.status);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      if (self.mode === "step") self.advanceStep();
      else self.submitAll();
    });

    this.form = form;
    this.root.appendChild(form);
    this.restoreControls();
    if (this.mode === "step") {
      if (!this.history.length) this.history = this.questions[0] ? [this.questions[0].id] : [];
      if (this.questions[0] && this.history[0] !== this.questions[0].id) this.history.unshift(this.questions[0].id);
      if (this.history[0]) this.showStep(this.history[this.history.length - 1]);
    } else {
      this.syncVisibleFields();
    }
  };

  NativeForm.prototype.showStep = function (questionId) {
    var self = this;
    this.questions.forEach(function (question) {
      self.fields[question.id].hidden = question.id !== questionId;
    });
    var question = this.questions.find(function (item) {
      return item.id === questionId;
    });
    var next = question ? this.nextId(question, this.answers[question.id]) : null;
    this.backButton.disabled = this.history.length <= 1;
    this.submitButton.textContent = next ? "Avançar" : "Enviar";
    if (this.progress) {
      this.progress.value = this.history.length;
      this.progress.textContent = this.history.length + " de " + this.questions.length;
    }
    var firstControl = this.fields[questionId].querySelector("input, textarea, button");
    if (firstControl) firstControl.focus({ preventScroll: true });
  };

  NativeForm.prototype.advanceStep = function () {
    var currentId = this.history[this.history.length - 1];
    var question = this.questions.find(function (item) {
      return item.id === currentId;
    });
    if (!question || !this.validateQuestion(question)) {
      var invalid = question && this.fields[question.id].querySelector("input, textarea, button");
      if (invalid) invalid.focus();
      return;
    }
    var next = this.nextId(question, this.answers[question.id]);
    if (next) {
      this.history.push(next);
      this.saveDraft();
      this.showStep(next);
    } else {
      this.submit(this.visibleQuestions());
    }
  };

  NativeForm.prototype.submitAll = function () {
    var self = this;
    var visible = this.visibleQuestions();
    var valid = true;
    visible.forEach(function (question) {
      if (!self.validateQuestion(question)) valid = false;
    });
    if (!valid) {
      var firstInvalid = this.form.querySelector("[data-invalid] input, [data-invalid] textarea, [data-invalid] button");
      if (firstInvalid) {
        firstInvalid.focus();
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }
    this.submit(visible);
  };

  NativeForm.prototype.submit = function (visible) {
    var self = this;
    var answers = visible
      .map(function (question) {
        var value = self.answers[question.id] || self.readAnswer(question);
        return value ? { questionId: question.id, value: value } : null;
      })
      .filter(Boolean);
    this.submitButton.disabled = true;
    if (this.backButton) this.backButton.disabled = true;
    this.status.textContent = "Enviando…";
    this.finalizing = true;
    if (this.autosaveTimer) window.clearTimeout(this.autosaveTimer);
    emit(this.root, "submit", { formId: this.data.id });

    fetch(this.responseEndpoint(), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        answers: answers,
        website: this.honeypot.value,
        pageUrl: window.location.href,
        isEmbed: true,
      }),
    })
      .then(function (response) {
        return response.json().then(function (body) {
          if (!response.ok) {
            var error = new Error(body.error || "Não foi possível enviar o formulário.");
            error.fields = body.fields || {};
            throw error;
          }
          return body;
        });
      })
      .then(function (result) {
        self.renderSuccess(result);
      })
      .catch(function (error) {
        self.finalizing = false;
        self.submitButton.disabled = false;
        if (self.backButton) self.backButton.disabled = self.history.length <= 1;
        self.status.textContent = error.message || "Não foi possível enviar. Tente novamente.";
        Object.keys(error.fields || {}).forEach(function (questionId) {
          var question = self.questions.find(function (item) {
            return item.id === questionId;
          });
          if (question) self.setError(question, error.fields[questionId]);
        });
        emit(self.root, "error", { formId: self.data.id, message: self.status.textContent });
      });
  };

  NativeForm.prototype.renderSuccess = function (result) {
    this.finalizing = false;
    this.finalized = true;
    this.unbindRecoveryEvents();
    var thankYou = result.thankYou || this.data.thankYou || {};
    this.clearDraft();
    this.root.replaceChildren();
    var section = element("section", {
      className: "arcaffo-success",
      "data-arcaffo-screen": "success",
      role: "status",
      "aria-labelledby": this.instanceId + "-success-title",
    });
    section.appendChild(
      element("h2", { id: this.instanceId + "-success-title" }, thankYou.title || "Resposta enviada")
    );
    if (thankYou.description) section.appendChild(element("p", {}, thankYou.description));
    this.root.appendChild(section);
    emit(this.root, "success", { formId: this.data.id, responseId: result.responseId });
    var successRedirect = this.root.getAttribute("data-success-redirect");
    // The site can select a same-origin confirmation page without changing the form.
    var redirectUrl = successRedirect && /^\/(?!\/)/.test(successRedirect) ? successRedirect : thankYou.redirect_url;
    if (redirectUrl) {
      window.setTimeout(function () {
        window.location.assign(redirectUrl);
      }, 1200);
    }
  };

  function mount(root) {
    if (!root || root.getAttribute("data-arcaffo-mounted") === "true") return;
    var identifier = root.getAttribute("data-arcaffo-form") || root.getAttribute("data-dealeto-form");
    if (!identifier) return;
    root.setAttribute("data-arcaffo-mounted", "true");
    root.replaceChildren(element("p", { className: "arcaffo-loading", role: "status" }, "Carregando formulário…"));

    fetch(apiOrigin + "/api/embed/forms/" + encodeURIComponent(identifier), {
      headers: { Accept: "application/json" },
    })
      .then(function (response) {
        return response.json().then(function (body) {
          if (!response.ok) throw new Error(body.error || "Não foi possível carregar o formulário.");
          return body;
        });
      })
      .then(function (data) {
        new NativeForm(root, data);
      })
      .catch(function (error) {
        root.replaceChildren(
          element("p", { className: "arcaffo-load-error", role: "alert" }, error.message || "Não foi possível carregar o formulário.")
        );
        root.removeAttribute("data-arcaffo-mounted");
        emit(root, "error", { message: error.message });
      });
  }

  function scan(scope) {
    if (scope.matches && scope.matches(selector)) mount(scope);
    if (scope.querySelectorAll) scope.querySelectorAll(selector).forEach(mount);
  }

  window.ArcaffoForms = Object.assign(window.ArcaffoForms || {}, { mount: mount, scan: scan });
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function () { scan(document); });
  else scan(document);

  new MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      mutation.addedNodes.forEach(function (node) {
        if (node.nodeType === 1) scan(node);
      });
    });
  }).observe(document.documentElement, { childList: true, subtree: true });
})();
