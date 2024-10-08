(() => {
  var Pe = Object.defineProperty;
  var en = (o, t, e) =>
    t in o
      ? Pe(o, t, { enumerable: !0, configurable: !0, writable: !0, value: e })
      : (o[t] = e);
  var _e = (o, t) => {
    for (var e in t) Pe(o, e, { get: t[e], enumerable: !0 });
  };
  var Ft = (o, t, e) => (en(o, typeof t != "symbol" ? t + "" : t, e), e);
  var qt = class {
    constructor(t, e, i) {
      (this.eventTarget = t),
        (this.eventName = e),
        (this.eventOptions = i),
        (this.unorderedBindings = new Set());
    }
    connect() {
      this.eventTarget.addEventListener(
        this.eventName,
        this,
        this.eventOptions,
      );
    }
    disconnect() {
      this.eventTarget.removeEventListener(
        this.eventName,
        this,
        this.eventOptions,
      );
    }
    bindingConnected(t) {
      this.unorderedBindings.add(t);
    }
    bindingDisconnected(t) {
      this.unorderedBindings.delete(t);
    }
    handleEvent(t) {
      let e = nn(t);
      for (let i of this.bindings) {
        if (e.immediatePropagationStopped) break;
        i.handleEvent(e);
      }
    }
    hasBindings() {
      return this.unorderedBindings.size > 0;
    }
    get bindings() {
      return Array.from(this.unorderedBindings).sort((t, e) => {
        let i = t.index,
          n = e.index;
        return i < n ? -1 : i > n ? 1 : 0;
      });
    }
  };
  function nn(o) {
    if ("immediatePropagationStopped" in o) return o;
    {
      let { stopImmediatePropagation: t } = o;
      return Object.assign(o, {
        immediatePropagationStopped: !1,
        stopImmediatePropagation() {
          (this.immediatePropagationStopped = !0), t.call(this);
        },
      });
    }
  }
  var $t = class {
      constructor(t) {
        (this.application = t),
          (this.eventListenerMaps = new Map()),
          (this.started = !1);
      }
      start() {
        this.started ||
          ((this.started = !0),
          this.eventListeners.forEach((t) => t.connect()));
      }
      stop() {
        this.started &&
          ((this.started = !1),
          this.eventListeners.forEach((t) => t.disconnect()));
      }
      get eventListeners() {
        return Array.from(this.eventListenerMaps.values()).reduce(
          (t, e) => t.concat(Array.from(e.values())),
          [],
        );
      }
      bindingConnected(t) {
        this.fetchEventListenerForBinding(t).bindingConnected(t);
      }
      bindingDisconnected(t, e = !1) {
        this.fetchEventListenerForBinding(t).bindingDisconnected(t),
          e && this.clearEventListenersForBinding(t);
      }
      handleError(t, e, i = {}) {
        this.application.handleError(t, `Error ${e}`, i);
      }
      clearEventListenersForBinding(t) {
        let e = this.fetchEventListenerForBinding(t);
        e.hasBindings() ||
          (e.disconnect(), this.removeMappedEventListenerFor(t));
      }
      removeMappedEventListenerFor(t) {
        let { eventTarget: e, eventName: i, eventOptions: n } = t,
          s = this.fetchEventListenerMapForEventTarget(e),
          a = this.cacheKey(i, n);
        s.delete(a), s.size == 0 && this.eventListenerMaps.delete(e);
      }
      fetchEventListenerForBinding(t) {
        let { eventTarget: e, eventName: i, eventOptions: n } = t;
        return this.fetchEventListener(e, i, n);
      }
      fetchEventListener(t, e, i) {
        let n = this.fetchEventListenerMapForEventTarget(t),
          s = this.cacheKey(e, i),
          a = n.get(s);
        return a || ((a = this.createEventListener(t, e, i)), n.set(s, a)), a;
      }
      createEventListener(t, e, i) {
        let n = new qt(t, e, i);
        return this.started && n.connect(), n;
      }
      fetchEventListenerMapForEventTarget(t) {
        let e = this.eventListenerMaps.get(t);
        return e || ((e = new Map()), this.eventListenerMaps.set(t, e)), e;
      }
      cacheKey(t, e) {
        let i = [t];
        return (
          Object.keys(e)
            .sort()
            .forEach((n) => {
              i.push(`${e[n] ? "" : "!"}${n}`);
            }),
          i.join(":")
        );
      }
    },
    sn = {
      stop({ event: o, value: t }) {
        return t && o.stopPropagation(), !0;
      },
      prevent({ event: o, value: t }) {
        return t && o.preventDefault(), !0;
      },
      self({ event: o, value: t, element: e }) {
        return t ? e === o.target : !0;
      },
    },
    on =
      /^(?:(?:([^.]+?)\+)?(.+?)(?:\.(.+?))?(?:@(window|document))?->)?(.+?)(?:#([^:]+?))(?::(.+))?$/;
  function an(o) {
    let e = o.trim().match(on) || [],
      i = e[2],
      n = e[3];
    return (
      n &&
        !["keydown", "keyup", "keypress"].includes(i) &&
        ((i += `.${n}`), (n = "")),
      {
        eventTarget: rn(e[4]),
        eventName: i,
        eventOptions: e[7] ? ln(e[7]) : {},
        identifier: e[5],
        methodName: e[6],
        keyFilter: e[1] || n,
      }
    );
  }
  function rn(o) {
    if (o == "window") return window;
    if (o == "document") return document;
  }
  function ln(o) {
    return o
      .split(":")
      .reduce(
        (t, e) => Object.assign(t, { [e.replace(/^!/, "")]: !/^!/.test(e) }),
        {},
      );
  }
  function cn(o) {
    if (o == window) return "window";
    if (o == document) return "document";
  }
  function ve(o) {
    return o.replace(/(?:[_-])([a-z0-9])/g, (t, e) => e.toUpperCase());
  }
  function te(o) {
    return ve(o.replace(/--/g, "-").replace(/__/g, "_"));
  }
  function ut(o) {
    return o.charAt(0).toUpperCase() + o.slice(1);
  }
  function ai(o) {
    return o.replace(/([A-Z])/g, (t, e) => `-${e.toLowerCase()}`);
  }
  function dn(o) {
    return o.match(/[^\s]+/g) || [];
  }
  function Ke(o) {
    return o != null;
  }
  function ee(o, t) {
    return Object.prototype.hasOwnProperty.call(o, t);
  }
  var qe = ["meta", "ctrl", "alt", "shift"],
    ie = class {
      constructor(t, e, i, n) {
        (this.element = t),
          (this.index = e),
          (this.eventTarget = i.eventTarget || t),
          (this.eventName = i.eventName || hn(t) || yt("missing event name")),
          (this.eventOptions = i.eventOptions || {}),
          (this.identifier = i.identifier || yt("missing identifier")),
          (this.methodName = i.methodName || yt("missing method name")),
          (this.keyFilter = i.keyFilter || ""),
          (this.schema = n);
      }
      static forToken(t, e) {
        return new this(t.element, t.index, an(t.content), e);
      }
      toString() {
        let t = this.keyFilter ? `.${this.keyFilter}` : "",
          e = this.eventTargetName ? `@${this.eventTargetName}` : "";
        return `${this.eventName}${t}${e}->${this.identifier}#${this.methodName}`;
      }
      shouldIgnoreKeyboardEvent(t) {
        if (!this.keyFilter) return !1;
        let e = this.keyFilter.split("+");
        if (this.keyFilterDissatisfied(t, e)) return !0;
        let i = e.filter((n) => !qe.includes(n))[0];
        return i
          ? (ee(this.keyMappings, i) ||
              yt(`contains unknown key filter: ${this.keyFilter}`),
            this.keyMappings[i].toLowerCase() !== t.key.toLowerCase())
          : !1;
      }
      shouldIgnoreMouseEvent(t) {
        if (!this.keyFilter) return !1;
        let e = [this.keyFilter];
        return !!this.keyFilterDissatisfied(t, e);
      }
      get params() {
        let t = {},
          e = new RegExp(`^data-${this.identifier}-(.+)-param$`, "i");
        for (let { name: i, value: n } of Array.from(this.element.attributes)) {
          let s = i.match(e),
            a = s && s[1];
          a && (t[ve(a)] = un(n));
        }
        return t;
      }
      get eventTargetName() {
        return cn(this.eventTarget);
      }
      get keyMappings() {
        return this.schema.keyMappings;
      }
      keyFilterDissatisfied(t, e) {
        let [i, n, s, a] = qe.map((r) => e.includes(r));
        return (
          t.metaKey !== i ||
          t.ctrlKey !== n ||
          t.altKey !== s ||
          t.shiftKey !== a
        );
      }
    },
    $e = {
      a: () => "click",
      button: () => "click",
      form: () => "submit",
      details: () => "toggle",
      input: (o) => (o.getAttribute("type") == "submit" ? "click" : "input"),
      select: () => "change",
      textarea: () => "input",
    };
  function hn(o) {
    let t = o.tagName.toLowerCase();
    if (t in $e) return $e[t](o);
  }
  function yt(o) {
    throw new Error(o);
  }
  function un(o) {
    try {
      return JSON.parse(o);
    } catch {
      return o;
    }
  }
  var ne = class {
      constructor(t, e) {
        (this.context = t), (this.action = e);
      }
      get index() {
        return this.action.index;
      }
      get eventTarget() {
        return this.action.eventTarget;
      }
      get eventOptions() {
        return this.action.eventOptions;
      }
      get identifier() {
        return this.context.identifier;
      }
      handleEvent(t) {
        let e = this.prepareActionEvent(t);
        this.willBeInvokedByEvent(t) &&
          this.applyEventModifiers(e) &&
          this.invokeWithEvent(e);
      }
      get eventName() {
        return this.action.eventName;
      }
      get method() {
        let t = this.controller[this.methodName];
        if (typeof t == "function") return t;
        throw new Error(
          `Action "${this.action}" references undefined method "${this.methodName}"`,
        );
      }
      applyEventModifiers(t) {
        let { element: e } = this.action,
          { actionDescriptorFilters: i } = this.context.application,
          { controller: n } = this.context,
          s = !0;
        for (let [a, r] of Object.entries(this.eventOptions))
          if (a in i) {
            let l = i[a];
            s =
              s &&
              l({ name: a, value: r, event: t, element: e, controller: n });
          } else continue;
        return s;
      }
      prepareActionEvent(t) {
        return Object.assign(t, { params: this.action.params });
      }
      invokeWithEvent(t) {
        let { target: e, currentTarget: i } = t;
        try {
          this.method.call(this.controller, t),
            this.context.logDebugActivity(this.methodName, {
              event: t,
              target: e,
              currentTarget: i,
              action: this.methodName,
            });
        } catch (n) {
          let { identifier: s, controller: a, element: r, index: l } = this,
            c = {
              identifier: s,
              controller: a,
              element: r,
              index: l,
              event: t,
            };
          this.context.handleError(n, `invoking action "${this.action}"`, c);
        }
      }
      willBeInvokedByEvent(t) {
        let e = t.target;
        return (t instanceof KeyboardEvent &&
          this.action.shouldIgnoreKeyboardEvent(t)) ||
          (t instanceof MouseEvent && this.action.shouldIgnoreMouseEvent(t))
          ? !1
          : this.element === e
            ? !0
            : e instanceof Element && this.element.contains(e)
              ? this.scope.containsElement(e)
              : this.scope.containsElement(this.action.element);
      }
      get controller() {
        return this.context.controller;
      }
      get methodName() {
        return this.action.methodName;
      }
      get element() {
        return this.scope.element;
      }
      get scope() {
        return this.context.scope;
      }
    },
    vt = class {
      constructor(t, e) {
        (this.mutationObserverInit = {
          attributes: !0,
          childList: !0,
          subtree: !0,
        }),
          (this.element = t),
          (this.started = !1),
          (this.delegate = e),
          (this.elements = new Set()),
          (this.mutationObserver = new MutationObserver((i) =>
            this.processMutations(i),
          ));
      }
      start() {
        this.started ||
          ((this.started = !0),
          this.mutationObserver.observe(
            this.element,
            this.mutationObserverInit,
          ),
          this.refresh());
      }
      pause(t) {
        this.started &&
          (this.mutationObserver.disconnect(), (this.started = !1)),
          t(),
          this.started ||
            (this.mutationObserver.observe(
              this.element,
              this.mutationObserverInit,
            ),
            (this.started = !0));
      }
      stop() {
        this.started &&
          (this.mutationObserver.takeRecords(),
          this.mutationObserver.disconnect(),
          (this.started = !1));
      }
      refresh() {
        if (this.started) {
          let t = new Set(this.matchElementsInTree());
          for (let e of Array.from(this.elements))
            t.has(e) || this.removeElement(e);
          for (let e of Array.from(t)) this.addElement(e);
        }
      }
      processMutations(t) {
        if (this.started) for (let e of t) this.processMutation(e);
      }
      processMutation(t) {
        t.type == "attributes"
          ? this.processAttributeChange(t.target, t.attributeName)
          : t.type == "childList" &&
            (this.processRemovedNodes(t.removedNodes),
            this.processAddedNodes(t.addedNodes));
      }
      processAttributeChange(t, e) {
        this.elements.has(t)
          ? this.delegate.elementAttributeChanged && this.matchElement(t)
            ? this.delegate.elementAttributeChanged(t, e)
            : this.removeElement(t)
          : this.matchElement(t) && this.addElement(t);
      }
      processRemovedNodes(t) {
        for (let e of Array.from(t)) {
          let i = this.elementFromNode(e);
          i && this.processTree(i, this.removeElement);
        }
      }
      processAddedNodes(t) {
        for (let e of Array.from(t)) {
          let i = this.elementFromNode(e);
          i && this.elementIsActive(i) && this.processTree(i, this.addElement);
        }
      }
      matchElement(t) {
        return this.delegate.matchElement(t);
      }
      matchElementsInTree(t = this.element) {
        return this.delegate.matchElementsInTree(t);
      }
      processTree(t, e) {
        for (let i of this.matchElementsInTree(t)) e.call(this, i);
      }
      elementFromNode(t) {
        if (t.nodeType == Node.ELEMENT_NODE) return t;
      }
      elementIsActive(t) {
        return t.isConnected != this.element.isConnected
          ? !1
          : this.element.contains(t);
      }
      addElement(t) {
        this.elements.has(t) ||
          (this.elementIsActive(t) &&
            (this.elements.add(t),
            this.delegate.elementMatched && this.delegate.elementMatched(t)));
      }
      removeElement(t) {
        this.elements.has(t) &&
          (this.elements.delete(t),
          this.delegate.elementUnmatched && this.delegate.elementUnmatched(t));
      }
    },
    Bt = class {
      constructor(t, e, i) {
        (this.attributeName = e),
          (this.delegate = i),
          (this.elementObserver = new vt(t, this));
      }
      get element() {
        return this.elementObserver.element;
      }
      get selector() {
        return `[${this.attributeName}]`;
      }
      start() {
        this.elementObserver.start();
      }
      pause(t) {
        this.elementObserver.pause(t);
      }
      stop() {
        this.elementObserver.stop();
      }
      refresh() {
        this.elementObserver.refresh();
      }
      get started() {
        return this.elementObserver.started;
      }
      matchElement(t) {
        return t.hasAttribute(this.attributeName);
      }
      matchElementsInTree(t) {
        let e = this.matchElement(t) ? [t] : [],
          i = Array.from(t.querySelectorAll(this.selector));
        return e.concat(i);
      }
      elementMatched(t) {
        this.delegate.elementMatchedAttribute &&
          this.delegate.elementMatchedAttribute(t, this.attributeName);
      }
      elementUnmatched(t) {
        this.delegate.elementUnmatchedAttribute &&
          this.delegate.elementUnmatchedAttribute(t, this.attributeName);
      }
      elementAttributeChanged(t, e) {
        this.delegate.elementAttributeValueChanged &&
          this.attributeName == e &&
          this.delegate.elementAttributeValueChanged(t, e);
      }
    };
  function mn(o, t, e) {
    ri(o, t).add(e);
  }
  function bn(o, t, e) {
    ri(o, t).delete(e), pn(o, t);
  }
  function ri(o, t) {
    let e = o.get(t);
    return e || ((e = new Set()), o.set(t, e)), e;
  }
  function pn(o, t) {
    let e = o.get(t);
    e != null && e.size == 0 && o.delete(t);
  }
  var T = class {
    constructor() {
      this.valuesByKey = new Map();
    }
    get keys() {
      return Array.from(this.valuesByKey.keys());
    }
    get values() {
      return Array.from(this.valuesByKey.values()).reduce(
        (e, i) => e.concat(Array.from(i)),
        [],
      );
    }
    get size() {
      return Array.from(this.valuesByKey.values()).reduce(
        (e, i) => e + i.size,
        0,
      );
    }
    add(t, e) {
      mn(this.valuesByKey, t, e);
    }
    delete(t, e) {
      bn(this.valuesByKey, t, e);
    }
    has(t, e) {
      let i = this.valuesByKey.get(t);
      return i != null && i.has(e);
    }
    hasKey(t) {
      return this.valuesByKey.has(t);
    }
    hasValue(t) {
      return Array.from(this.valuesByKey.values()).some((i) => i.has(t));
    }
    getValuesForKey(t) {
      let e = this.valuesByKey.get(t);
      return e ? Array.from(e) : [];
    }
    getKeysForValue(t) {
      return Array.from(this.valuesByKey)
        .filter(([e, i]) => i.has(t))
        .map(([e, i]) => e);
    }
  };
  var se = class {
      constructor(t, e, i, n) {
        (this._selector = e),
          (this.details = n),
          (this.elementObserver = new vt(t, this)),
          (this.delegate = i),
          (this.matchesByElement = new T());
      }
      get started() {
        return this.elementObserver.started;
      }
      get selector() {
        return this._selector;
      }
      set selector(t) {
        (this._selector = t), this.refresh();
      }
      start() {
        this.elementObserver.start();
      }
      pause(t) {
        this.elementObserver.pause(t);
      }
      stop() {
        this.elementObserver.stop();
      }
      refresh() {
        this.elementObserver.refresh();
      }
      get element() {
        return this.elementObserver.element;
      }
      matchElement(t) {
        let { selector: e } = this;
        if (e) {
          let i = t.matches(e);
          return this.delegate.selectorMatchElement
            ? i && this.delegate.selectorMatchElement(t, this.details)
            : i;
        } else return !1;
      }
      matchElementsInTree(t) {
        let { selector: e } = this;
        if (e) {
          let i = this.matchElement(t) ? [t] : [],
            n = Array.from(t.querySelectorAll(e)).filter((s) =>
              this.matchElement(s),
            );
          return i.concat(n);
        } else return [];
      }
      elementMatched(t) {
        let { selector: e } = this;
        e && this.selectorMatched(t, e);
      }
      elementUnmatched(t) {
        let e = this.matchesByElement.getKeysForValue(t);
        for (let i of e) this.selectorUnmatched(t, i);
      }
      elementAttributeChanged(t, e) {
        let { selector: i } = this;
        if (i) {
          let n = this.matchElement(t),
            s = this.matchesByElement.has(i, t);
          n && !s
            ? this.selectorMatched(t, i)
            : !n && s && this.selectorUnmatched(t, i);
        }
      }
      selectorMatched(t, e) {
        this.delegate.selectorMatched(t, e, this.details),
          this.matchesByElement.add(e, t);
      }
      selectorUnmatched(t, e) {
        this.delegate.selectorUnmatched(t, e, this.details),
          this.matchesByElement.delete(e, t);
      }
    },
    oe = class {
      constructor(t, e) {
        (this.element = t),
          (this.delegate = e),
          (this.started = !1),
          (this.stringMap = new Map()),
          (this.mutationObserver = new MutationObserver((i) =>
            this.processMutations(i),
          ));
      }
      start() {
        this.started ||
          ((this.started = !0),
          this.mutationObserver.observe(this.element, {
            attributes: !0,
            attributeOldValue: !0,
          }),
          this.refresh());
      }
      stop() {
        this.started &&
          (this.mutationObserver.takeRecords(),
          this.mutationObserver.disconnect(),
          (this.started = !1));
      }
      refresh() {
        if (this.started)
          for (let t of this.knownAttributeNames)
            this.refreshAttribute(t, null);
      }
      processMutations(t) {
        if (this.started) for (let e of t) this.processMutation(e);
      }
      processMutation(t) {
        let e = t.attributeName;
        e && this.refreshAttribute(e, t.oldValue);
      }
      refreshAttribute(t, e) {
        let i = this.delegate.getStringMapKeyForAttribute(t);
        if (i != null) {
          this.stringMap.has(t) || this.stringMapKeyAdded(i, t);
          let n = this.element.getAttribute(t);
          if (
            (this.stringMap.get(t) != n && this.stringMapValueChanged(n, i, e),
            n == null)
          ) {
            let s = this.stringMap.get(t);
            this.stringMap.delete(t), s && this.stringMapKeyRemoved(i, t, s);
          } else this.stringMap.set(t, n);
        }
      }
      stringMapKeyAdded(t, e) {
        this.delegate.stringMapKeyAdded &&
          this.delegate.stringMapKeyAdded(t, e);
      }
      stringMapValueChanged(t, e, i) {
        this.delegate.stringMapValueChanged &&
          this.delegate.stringMapValueChanged(t, e, i);
      }
      stringMapKeyRemoved(t, e, i) {
        this.delegate.stringMapKeyRemoved &&
          this.delegate.stringMapKeyRemoved(t, e, i);
      }
      get knownAttributeNames() {
        return Array.from(
          new Set(
            this.currentAttributeNames.concat(this.recordedAttributeNames),
          ),
        );
      }
      get currentAttributeNames() {
        return Array.from(this.element.attributes).map((t) => t.name);
      }
      get recordedAttributeNames() {
        return Array.from(this.stringMap.keys());
      }
    },
    xt = class {
      constructor(t, e, i) {
        (this.attributeObserver = new Bt(t, e, this)),
          (this.delegate = i),
          (this.tokensByElement = new T());
      }
      get started() {
        return this.attributeObserver.started;
      }
      start() {
        this.attributeObserver.start();
      }
      pause(t) {
        this.attributeObserver.pause(t);
      }
      stop() {
        this.attributeObserver.stop();
      }
      refresh() {
        this.attributeObserver.refresh();
      }
      get element() {
        return this.attributeObserver.element;
      }
      get attributeName() {
        return this.attributeObserver.attributeName;
      }
      elementMatchedAttribute(t) {
        this.tokensMatched(this.readTokensForElement(t));
      }
      elementAttributeValueChanged(t) {
        let [e, i] = this.refreshTokensForElement(t);
        this.tokensUnmatched(e), this.tokensMatched(i);
      }
      elementUnmatchedAttribute(t) {
        this.tokensUnmatched(this.tokensByElement.getValuesForKey(t));
      }
      tokensMatched(t) {
        t.forEach((e) => this.tokenMatched(e));
      }
      tokensUnmatched(t) {
        t.forEach((e) => this.tokenUnmatched(e));
      }
      tokenMatched(t) {
        this.delegate.tokenMatched(t), this.tokensByElement.add(t.element, t);
      }
      tokenUnmatched(t) {
        this.delegate.tokenUnmatched(t),
          this.tokensByElement.delete(t.element, t);
      }
      refreshTokensForElement(t) {
        let e = this.tokensByElement.getValuesForKey(t),
          i = this.readTokensForElement(t),
          n = gn(e, i).findIndex(([s, a]) => !Qn(s, a));
        return n == -1 ? [[], []] : [e.slice(n), i.slice(n)];
      }
      readTokensForElement(t) {
        let e = this.attributeName,
          i = t.getAttribute(e) || "";
        return fn(i, t, e);
      }
    };
  function fn(o, t, e) {
    return o
      .trim()
      .split(/\s+/)
      .filter((i) => i.length)
      .map((i, n) => ({ element: t, attributeName: e, content: i, index: n }));
  }
  function gn(o, t) {
    let e = Math.max(o.length, t.length);
    return Array.from({ length: e }, (i, n) => [o[n], t[n]]);
  }
  function Qn(o, t) {
    return o && t && o.index == t.index && o.content == t.content;
  }
  var Ut = class {
      constructor(t, e, i) {
        (this.tokenListObserver = new xt(t, e, this)),
          (this.delegate = i),
          (this.parseResultsByToken = new WeakMap()),
          (this.valuesByTokenByElement = new WeakMap());
      }
      get started() {
        return this.tokenListObserver.started;
      }
      start() {
        this.tokenListObserver.start();
      }
      stop() {
        this.tokenListObserver.stop();
      }
      refresh() {
        this.tokenListObserver.refresh();
      }
      get element() {
        return this.tokenListObserver.element;
      }
      get attributeName() {
        return this.tokenListObserver.attributeName;
      }
      tokenMatched(t) {
        let { element: e } = t,
          { value: i } = this.fetchParseResultForToken(t);
        i &&
          (this.fetchValuesByTokenForElement(e).set(t, i),
          this.delegate.elementMatchedValue(e, i));
      }
      tokenUnmatched(t) {
        let { element: e } = t,
          { value: i } = this.fetchParseResultForToken(t);
        i &&
          (this.fetchValuesByTokenForElement(e).delete(t),
          this.delegate.elementUnmatchedValue(e, i));
      }
      fetchParseResultForToken(t) {
        let e = this.parseResultsByToken.get(t);
        return (
          e || ((e = this.parseToken(t)), this.parseResultsByToken.set(t, e)), e
        );
      }
      fetchValuesByTokenForElement(t) {
        let e = this.valuesByTokenByElement.get(t);
        return e || ((e = new Map()), this.valuesByTokenByElement.set(t, e)), e;
      }
      parseToken(t) {
        try {
          return { value: this.delegate.parseValueForToken(t) };
        } catch (e) {
          return { error: e };
        }
      }
    },
    ae = class {
      constructor(t, e) {
        (this.context = t),
          (this.delegate = e),
          (this.bindingsByAction = new Map());
      }
      start() {
        this.valueListObserver ||
          ((this.valueListObserver = new Ut(
            this.element,
            this.actionAttribute,
            this,
          )),
          this.valueListObserver.start());
      }
      stop() {
        this.valueListObserver &&
          (this.valueListObserver.stop(),
          delete this.valueListObserver,
          this.disconnectAllActions());
      }
      get element() {
        return this.context.element;
      }
      get identifier() {
        return this.context.identifier;
      }
      get actionAttribute() {
        return this.schema.actionAttribute;
      }
      get schema() {
        return this.context.schema;
      }
      get bindings() {
        return Array.from(this.bindingsByAction.values());
      }
      connectAction(t) {
        let e = new ne(this.context, t);
        this.bindingsByAction.set(t, e), this.delegate.bindingConnected(e);
      }
      disconnectAction(t) {
        let e = this.bindingsByAction.get(t);
        e &&
          (this.bindingsByAction.delete(t),
          this.delegate.bindingDisconnected(e));
      }
      disconnectAllActions() {
        this.bindings.forEach((t) => this.delegate.bindingDisconnected(t, !0)),
          this.bindingsByAction.clear();
      }
      parseValueForToken(t) {
        let e = ie.forToken(t, this.schema);
        if (e.identifier == this.identifier) return e;
      }
      elementMatchedValue(t, e) {
        this.connectAction(e);
      }
      elementUnmatchedValue(t, e) {
        this.disconnectAction(e);
      }
    },
    re = class {
      constructor(t, e) {
        (this.context = t),
          (this.receiver = e),
          (this.stringMapObserver = new oe(this.element, this)),
          (this.valueDescriptorMap = this.controller.valueDescriptorMap);
      }
      start() {
        this.stringMapObserver.start(),
          this.invokeChangedCallbacksForDefaultValues();
      }
      stop() {
        this.stringMapObserver.stop();
      }
      get element() {
        return this.context.element;
      }
      get controller() {
        return this.context.controller;
      }
      getStringMapKeyForAttribute(t) {
        if (t in this.valueDescriptorMap)
          return this.valueDescriptorMap[t].name;
      }
      stringMapKeyAdded(t, e) {
        let i = this.valueDescriptorMap[e];
        this.hasValue(t) ||
          this.invokeChangedCallback(
            t,
            i.writer(this.receiver[t]),
            i.writer(i.defaultValue),
          );
      }
      stringMapValueChanged(t, e, i) {
        let n = this.valueDescriptorNameMap[e];
        t !== null &&
          (i === null && (i = n.writer(n.defaultValue)),
          this.invokeChangedCallback(e, t, i));
      }
      stringMapKeyRemoved(t, e, i) {
        let n = this.valueDescriptorNameMap[t];
        this.hasValue(t)
          ? this.invokeChangedCallback(t, n.writer(this.receiver[t]), i)
          : this.invokeChangedCallback(t, n.writer(n.defaultValue), i);
      }
      invokeChangedCallbacksForDefaultValues() {
        for (let { key: t, name: e, defaultValue: i, writer: n } of this
          .valueDescriptors)
          i != null &&
            !this.controller.data.has(t) &&
            this.invokeChangedCallback(e, n(i), void 0);
      }
      invokeChangedCallback(t, e, i) {
        let n = `${t}Changed`,
          s = this.receiver[n];
        if (typeof s == "function") {
          let a = this.valueDescriptorNameMap[t];
          try {
            let r = a.reader(e),
              l = i;
            i && (l = a.reader(i)), s.call(this.receiver, r, l);
          } catch (r) {
            throw (
              (r instanceof TypeError &&
                (r.message = `Stimulus Value "${this.context.identifier}.${a.name}" - ${r.message}`),
              r)
            );
          }
        }
      }
      get valueDescriptors() {
        let { valueDescriptorMap: t } = this;
        return Object.keys(t).map((e) => t[e]);
      }
      get valueDescriptorNameMap() {
        let t = {};
        return (
          Object.keys(this.valueDescriptorMap).forEach((e) => {
            let i = this.valueDescriptorMap[e];
            t[i.name] = i;
          }),
          t
        );
      }
      hasValue(t) {
        let e = this.valueDescriptorNameMap[t],
          i = `has${ut(e.name)}`;
        return this.receiver[i];
      }
    },
    le = class {
      constructor(t, e) {
        (this.context = t), (this.delegate = e), (this.targetsByName = new T());
      }
      start() {
        this.tokenListObserver ||
          ((this.tokenListObserver = new xt(
            this.element,
            this.attributeName,
            this,
          )),
          this.tokenListObserver.start());
      }
      stop() {
        this.tokenListObserver &&
          (this.disconnectAllTargets(),
          this.tokenListObserver.stop(),
          delete this.tokenListObserver);
      }
      tokenMatched({ element: t, content: e }) {
        this.scope.containsElement(t) && this.connectTarget(t, e);
      }
      tokenUnmatched({ element: t, content: e }) {
        this.disconnectTarget(t, e);
      }
      connectTarget(t, e) {
        var i;
        this.targetsByName.has(e, t) ||
          (this.targetsByName.add(e, t),
          (i = this.tokenListObserver) === null ||
            i === void 0 ||
            i.pause(() => this.delegate.targetConnected(t, e)));
      }
      disconnectTarget(t, e) {
        var i;
        this.targetsByName.has(e, t) &&
          (this.targetsByName.delete(e, t),
          (i = this.tokenListObserver) === null ||
            i === void 0 ||
            i.pause(() => this.delegate.targetDisconnected(t, e)));
      }
      disconnectAllTargets() {
        for (let t of this.targetsByName.keys)
          for (let e of this.targetsByName.getValuesForKey(t))
            this.disconnectTarget(e, t);
      }
      get attributeName() {
        return `data-${this.context.identifier}-target`;
      }
      get element() {
        return this.context.element;
      }
      get scope() {
        return this.context.scope;
      }
    };
  function mt(o, t) {
    let e = li(o);
    return Array.from(
      e.reduce((i, n) => (yn(n, t).forEach((s) => i.add(s)), i), new Set()),
    );
  }
  function Fn(o, t) {
    return li(o).reduce((i, n) => (i.push(...vn(n, t)), i), []);
  }
  function li(o) {
    let t = [];
    for (; o; ) t.push(o), (o = Object.getPrototypeOf(o));
    return t.reverse();
  }
  function yn(o, t) {
    let e = o[t];
    return Array.isArray(e) ? e : [];
  }
  function vn(o, t) {
    let e = o[t];
    return e ? Object.keys(e).map((i) => [i, e[i]]) : [];
  }
  var ce = class {
      constructor(t, e) {
        (this.started = !1),
          (this.context = t),
          (this.delegate = e),
          (this.outletsByName = new T()),
          (this.outletElementsByName = new T()),
          (this.selectorObserverMap = new Map()),
          (this.attributeObserverMap = new Map());
      }
      start() {
        this.started ||
          (this.outletDefinitions.forEach((t) => {
            this.setupSelectorObserverForOutlet(t),
              this.setupAttributeObserverForOutlet(t);
          }),
          (this.started = !0),
          this.dependentContexts.forEach((t) => t.refresh()));
      }
      refresh() {
        this.selectorObserverMap.forEach((t) => t.refresh()),
          this.attributeObserverMap.forEach((t) => t.refresh());
      }
      stop() {
        this.started &&
          ((this.started = !1),
          this.disconnectAllOutlets(),
          this.stopSelectorObservers(),
          this.stopAttributeObservers());
      }
      stopSelectorObservers() {
        this.selectorObserverMap.size > 0 &&
          (this.selectorObserverMap.forEach((t) => t.stop()),
          this.selectorObserverMap.clear());
      }
      stopAttributeObservers() {
        this.attributeObserverMap.size > 0 &&
          (this.attributeObserverMap.forEach((t) => t.stop()),
          this.attributeObserverMap.clear());
      }
      selectorMatched(t, e, { outletName: i }) {
        let n = this.getOutlet(t, i);
        n && this.connectOutlet(n, t, i);
      }
      selectorUnmatched(t, e, { outletName: i }) {
        let n = this.getOutletFromMap(t, i);
        n && this.disconnectOutlet(n, t, i);
      }
      selectorMatchElement(t, { outletName: e }) {
        let i = this.selector(e),
          n = this.hasOutlet(t, e),
          s = t.matches(`[${this.schema.controllerAttribute}~=${e}]`);
        return i ? n && s && t.matches(i) : !1;
      }
      elementMatchedAttribute(t, e) {
        let i = this.getOutletNameFromOutletAttributeName(e);
        i && this.updateSelectorObserverForOutlet(i);
      }
      elementAttributeValueChanged(t, e) {
        let i = this.getOutletNameFromOutletAttributeName(e);
        i && this.updateSelectorObserverForOutlet(i);
      }
      elementUnmatchedAttribute(t, e) {
        let i = this.getOutletNameFromOutletAttributeName(e);
        i && this.updateSelectorObserverForOutlet(i);
      }
      connectOutlet(t, e, i) {
        var n;
        this.outletElementsByName.has(i, e) ||
          (this.outletsByName.add(i, t),
          this.outletElementsByName.add(i, e),
          (n = this.selectorObserverMap.get(i)) === null ||
            n === void 0 ||
            n.pause(() => this.delegate.outletConnected(t, e, i)));
      }
      disconnectOutlet(t, e, i) {
        var n;
        this.outletElementsByName.has(i, e) &&
          (this.outletsByName.delete(i, t),
          this.outletElementsByName.delete(i, e),
          (n = this.selectorObserverMap.get(i)) === null ||
            n === void 0 ||
            n.pause(() => this.delegate.outletDisconnected(t, e, i)));
      }
      disconnectAllOutlets() {
        for (let t of this.outletElementsByName.keys)
          for (let e of this.outletElementsByName.getValuesForKey(t))
            for (let i of this.outletsByName.getValuesForKey(t))
              this.disconnectOutlet(i, e, t);
      }
      updateSelectorObserverForOutlet(t) {
        let e = this.selectorObserverMap.get(t);
        e && (e.selector = this.selector(t));
      }
      setupSelectorObserverForOutlet(t) {
        let e = this.selector(t),
          i = new se(document.body, e, this, { outletName: t });
        this.selectorObserverMap.set(t, i), i.start();
      }
      setupAttributeObserverForOutlet(t) {
        let e = this.attributeNameForOutletName(t),
          i = new Bt(this.scope.element, e, this);
        this.attributeObserverMap.set(t, i), i.start();
      }
      selector(t) {
        return this.scope.outlets.getSelectorForOutletName(t);
      }
      attributeNameForOutletName(t) {
        return this.scope.schema.outletAttributeForScope(this.identifier, t);
      }
      getOutletNameFromOutletAttributeName(t) {
        return this.outletDefinitions.find(
          (e) => this.attributeNameForOutletName(e) === t,
        );
      }
      get outletDependencies() {
        let t = new T();
        return (
          this.router.modules.forEach((e) => {
            let i = e.definition.controllerConstructor;
            mt(i, "outlets").forEach((s) => t.add(s, e.identifier));
          }),
          t
        );
      }
      get outletDefinitions() {
        return this.outletDependencies.getKeysForValue(this.identifier);
      }
      get dependentControllerIdentifiers() {
        return this.outletDependencies.getValuesForKey(this.identifier);
      }
      get dependentContexts() {
        let t = this.dependentControllerIdentifiers;
        return this.router.contexts.filter((e) => t.includes(e.identifier));
      }
      hasOutlet(t, e) {
        return !!this.getOutlet(t, e) || !!this.getOutletFromMap(t, e);
      }
      getOutlet(t, e) {
        return this.application.getControllerForElementAndIdentifier(t, e);
      }
      getOutletFromMap(t, e) {
        return this.outletsByName
          .getValuesForKey(e)
          .find((i) => i.element === t);
      }
      get scope() {
        return this.context.scope;
      }
      get schema() {
        return this.context.schema;
      }
      get identifier() {
        return this.context.identifier;
      }
      get application() {
        return this.context.application;
      }
      get router() {
        return this.application.router;
      }
    },
    de = class {
      constructor(t, e) {
        (this.logDebugActivity = (i, n = {}) => {
          let { identifier: s, controller: a, element: r } = this;
          (n = Object.assign({ identifier: s, controller: a, element: r }, n)),
            this.application.logDebugActivity(this.identifier, i, n);
        }),
          (this.module = t),
          (this.scope = e),
          (this.controller = new t.controllerConstructor(this)),
          (this.bindingObserver = new ae(this, this.dispatcher)),
          (this.valueObserver = new re(this, this.controller)),
          (this.targetObserver = new le(this, this)),
          (this.outletObserver = new ce(this, this));
        try {
          this.controller.initialize(), this.logDebugActivity("initialize");
        } catch (i) {
          this.handleError(i, "initializing controller");
        }
      }
      connect() {
        this.bindingObserver.start(),
          this.valueObserver.start(),
          this.targetObserver.start(),
          this.outletObserver.start();
        try {
          this.controller.connect(), this.logDebugActivity("connect");
        } catch (t) {
          this.handleError(t, "connecting controller");
        }
      }
      refresh() {
        this.outletObserver.refresh();
      }
      disconnect() {
        try {
          this.controller.disconnect(), this.logDebugActivity("disconnect");
        } catch (t) {
          this.handleError(t, "disconnecting controller");
        }
        this.outletObserver.stop(),
          this.targetObserver.stop(),
          this.valueObserver.stop(),
          this.bindingObserver.stop();
      }
      get application() {
        return this.module.application;
      }
      get identifier() {
        return this.module.identifier;
      }
      get schema() {
        return this.application.schema;
      }
      get dispatcher() {
        return this.application.dispatcher;
      }
      get element() {
        return this.scope.element;
      }
      get parentElement() {
        return this.element.parentElement;
      }
      handleError(t, e, i = {}) {
        let { identifier: n, controller: s, element: a } = this;
        (i = Object.assign({ identifier: n, controller: s, element: a }, i)),
          this.application.handleError(t, `Error ${e}`, i);
      }
      targetConnected(t, e) {
        this.invokeControllerMethod(`${e}TargetConnected`, t);
      }
      targetDisconnected(t, e) {
        this.invokeControllerMethod(`${e}TargetDisconnected`, t);
      }
      outletConnected(t, e, i) {
        this.invokeControllerMethod(`${te(i)}OutletConnected`, t, e);
      }
      outletDisconnected(t, e, i) {
        this.invokeControllerMethod(`${te(i)}OutletDisconnected`, t, e);
      }
      invokeControllerMethod(t, ...e) {
        let i = this.controller;
        typeof i[t] == "function" && i[t](...e);
      }
    };
  function Bn(o) {
    return xn(o, Un(o));
  }
  function xn(o, t) {
    let e = Wn(o),
      i = Ln(o.prototype, t);
    return Object.defineProperties(e.prototype, i), e;
  }
  function Un(o) {
    return mt(o, "blessings").reduce((e, i) => {
      let n = i(o);
      for (let s in n) {
        let a = e[s] || {};
        e[s] = Object.assign(a, n[s]);
      }
      return e;
    }, {});
  }
  function Ln(o, t) {
    return An(t).reduce((e, i) => {
      let n = wn(o, t, i);
      return n && Object.assign(e, { [i]: n }), e;
    }, {});
  }
  function wn(o, t, e) {
    let i = Object.getOwnPropertyDescriptor(o, e);
    if (!(i && "value" in i)) {
      let s = Object.getOwnPropertyDescriptor(t, e).value;
      return i && ((s.get = i.get || s.get), (s.set = i.set || s.set)), s;
    }
  }
  var An =
      typeof Object.getOwnPropertySymbols == "function"
        ? (o) => [
            ...Object.getOwnPropertyNames(o),
            ...Object.getOwnPropertySymbols(o),
          ]
        : Object.getOwnPropertyNames,
    Wn = (() => {
      function o(e) {
        function i() {
          return Reflect.construct(e, arguments, new.target);
        }
        return (
          (i.prototype = Object.create(e.prototype, {
            constructor: { value: i },
          })),
          Reflect.setPrototypeOf(i, e),
          i
        );
      }
      function t() {
        let i = o(function () {
          this.a.call(this);
        });
        return (i.prototype.a = function () {}), new i();
      }
      try {
        return t(), o;
      } catch {
        return (i) => class extends i {};
      }
    })();
  function Zn(o) {
    return {
      identifier: o.identifier,
      controllerConstructor: Bn(o.controllerConstructor),
    };
  }
  var he = class {
      constructor(t, e) {
        (this.application = t),
          (this.definition = Zn(e)),
          (this.contextsByScope = new WeakMap()),
          (this.connectedContexts = new Set());
      }
      get identifier() {
        return this.definition.identifier;
      }
      get controllerConstructor() {
        return this.definition.controllerConstructor;
      }
      get contexts() {
        return Array.from(this.connectedContexts);
      }
      connectContextForScope(t) {
        let e = this.fetchContextForScope(t);
        this.connectedContexts.add(e), e.connect();
      }
      disconnectContextForScope(t) {
        let e = this.contextsByScope.get(t);
        e && (this.connectedContexts.delete(e), e.disconnect());
      }
      fetchContextForScope(t) {
        let e = this.contextsByScope.get(t);
        return e || ((e = new de(this, t)), this.contextsByScope.set(t, e)), e;
      }
    },
    ue = class {
      constructor(t) {
        this.scope = t;
      }
      has(t) {
        return this.data.has(this.getDataKey(t));
      }
      get(t) {
        return this.getAll(t)[0];
      }
      getAll(t) {
        let e = this.data.get(this.getDataKey(t)) || "";
        return dn(e);
      }
      getAttributeName(t) {
        return this.data.getAttributeNameForKey(this.getDataKey(t));
      }
      getDataKey(t) {
        return `${t}-class`;
      }
      get data() {
        return this.scope.data;
      }
    },
    me = class {
      constructor(t) {
        this.scope = t;
      }
      get element() {
        return this.scope.element;
      }
      get identifier() {
        return this.scope.identifier;
      }
      get(t) {
        let e = this.getAttributeNameForKey(t);
        return this.element.getAttribute(e);
      }
      set(t, e) {
        let i = this.getAttributeNameForKey(t);
        return this.element.setAttribute(i, e), this.get(t);
      }
      has(t) {
        let e = this.getAttributeNameForKey(t);
        return this.element.hasAttribute(e);
      }
      delete(t) {
        if (this.has(t)) {
          let e = this.getAttributeNameForKey(t);
          return this.element.removeAttribute(e), !0;
        } else return !1;
      }
      getAttributeNameForKey(t) {
        return `data-${this.identifier}-${ai(t)}`;
      }
    },
    be = class {
      constructor(t) {
        (this.warnedKeysByObject = new WeakMap()), (this.logger = t);
      }
      warn(t, e, i) {
        let n = this.warnedKeysByObject.get(t);
        n || ((n = new Set()), this.warnedKeysByObject.set(t, n)),
          n.has(e) || (n.add(e), this.logger.warn(i, t));
      }
    };
  function pe(o, t) {
    return `[${o}~="${t}"]`;
  }
  var fe = class {
      constructor(t) {
        this.scope = t;
      }
      get element() {
        return this.scope.element;
      }
      get identifier() {
        return this.scope.identifier;
      }
      get schema() {
        return this.scope.schema;
      }
      has(t) {
        return this.find(t) != null;
      }
      find(...t) {
        return t.reduce(
          (e, i) => e || this.findTarget(i) || this.findLegacyTarget(i),
          void 0,
        );
      }
      findAll(...t) {
        return t.reduce(
          (e, i) => [
            ...e,
            ...this.findAllTargets(i),
            ...this.findAllLegacyTargets(i),
          ],
          [],
        );
      }
      findTarget(t) {
        let e = this.getSelectorForTargetName(t);
        return this.scope.findElement(e);
      }
      findAllTargets(t) {
        let e = this.getSelectorForTargetName(t);
        return this.scope.findAllElements(e);
      }
      getSelectorForTargetName(t) {
        let e = this.schema.targetAttributeForScope(this.identifier);
        return pe(e, t);
      }
      findLegacyTarget(t) {
        let e = this.getLegacySelectorForTargetName(t);
        return this.deprecate(this.scope.findElement(e), t);
      }
      findAllLegacyTargets(t) {
        let e = this.getLegacySelectorForTargetName(t);
        return this.scope.findAllElements(e).map((i) => this.deprecate(i, t));
      }
      getLegacySelectorForTargetName(t) {
        let e = `${this.identifier}.${t}`;
        return pe(this.schema.targetAttribute, e);
      }
      deprecate(t, e) {
        if (t) {
          let { identifier: i } = this,
            n = this.schema.targetAttribute,
            s = this.schema.targetAttributeForScope(i);
          this.guide.warn(
            t,
            `target:${e}`,
            `Please replace ${n}="${i}.${e}" with ${s}="${e}". The ${n} attribute is deprecated and will be removed in a future version of Stimulus.`,
          );
        }
        return t;
      }
      get guide() {
        return this.scope.guide;
      }
    },
    ge = class {
      constructor(t, e) {
        (this.scope = t), (this.controllerElement = e);
      }
      get element() {
        return this.scope.element;
      }
      get identifier() {
        return this.scope.identifier;
      }
      get schema() {
        return this.scope.schema;
      }
      has(t) {
        return this.find(t) != null;
      }
      find(...t) {
        return t.reduce((e, i) => e || this.findOutlet(i), void 0);
      }
      findAll(...t) {
        return t.reduce((e, i) => [...e, ...this.findAllOutlets(i)], []);
      }
      getSelectorForOutletName(t) {
        let e = this.schema.outletAttributeForScope(this.identifier, t);
        return this.controllerElement.getAttribute(e);
      }
      findOutlet(t) {
        let e = this.getSelectorForOutletName(t);
        if (e) return this.findElement(e, t);
      }
      findAllOutlets(t) {
        let e = this.getSelectorForOutletName(t);
        return e ? this.findAllElements(e, t) : [];
      }
      findElement(t, e) {
        return this.scope
          .queryElements(t)
          .filter((n) => this.matchesElement(n, t, e))[0];
      }
      findAllElements(t, e) {
        return this.scope
          .queryElements(t)
          .filter((n) => this.matchesElement(n, t, e));
      }
      matchesElement(t, e, i) {
        let n = t.getAttribute(this.scope.schema.controllerAttribute) || "";
        return t.matches(e) && n.split(" ").includes(i);
      }
    },
    Qe = class o {
      constructor(t, e, i, n) {
        (this.targets = new fe(this)),
          (this.classes = new ue(this)),
          (this.data = new me(this)),
          (this.containsElement = (s) =>
            s.closest(this.controllerSelector) === this.element),
          (this.schema = t),
          (this.element = e),
          (this.identifier = i),
          (this.guide = new be(n)),
          (this.outlets = new ge(this.documentScope, e));
      }
      findElement(t) {
        return this.element.matches(t)
          ? this.element
          : this.queryElements(t).find(this.containsElement);
      }
      findAllElements(t) {
        return [
          ...(this.element.matches(t) ? [this.element] : []),
          ...this.queryElements(t).filter(this.containsElement),
        ];
      }
      queryElements(t) {
        return Array.from(this.element.querySelectorAll(t));
      }
      get controllerSelector() {
        return pe(this.schema.controllerAttribute, this.identifier);
      }
      get isDocumentScope() {
        return this.element === document.documentElement;
      }
      get documentScope() {
        return this.isDocumentScope
          ? this
          : new o(
              this.schema,
              document.documentElement,
              this.identifier,
              this.guide.logger,
            );
      }
    },
    Fe = class {
      constructor(t, e, i) {
        (this.element = t),
          (this.schema = e),
          (this.delegate = i),
          (this.valueListObserver = new Ut(
            this.element,
            this.controllerAttribute,
            this,
          )),
          (this.scopesByIdentifierByElement = new WeakMap()),
          (this.scopeReferenceCounts = new WeakMap());
      }
      start() {
        this.valueListObserver.start();
      }
      stop() {
        this.valueListObserver.stop();
      }
      get controllerAttribute() {
        return this.schema.controllerAttribute;
      }
      parseValueForToken(t) {
        let { element: e, content: i } = t;
        return this.parseValueForElementAndIdentifier(e, i);
      }
      parseValueForElementAndIdentifier(t, e) {
        let i = this.fetchScopesByIdentifierForElement(t),
          n = i.get(e);
        return (
          n ||
            ((n = this.delegate.createScopeForElementAndIdentifier(t, e)),
            i.set(e, n)),
          n
        );
      }
      elementMatchedValue(t, e) {
        let i = (this.scopeReferenceCounts.get(e) || 0) + 1;
        this.scopeReferenceCounts.set(e, i),
          i == 1 && this.delegate.scopeConnected(e);
      }
      elementUnmatchedValue(t, e) {
        let i = this.scopeReferenceCounts.get(e);
        i &&
          (this.scopeReferenceCounts.set(e, i - 1),
          i == 1 && this.delegate.scopeDisconnected(e));
      }
      fetchScopesByIdentifierForElement(t) {
        let e = this.scopesByIdentifierByElement.get(t);
        return (
          e || ((e = new Map()), this.scopesByIdentifierByElement.set(t, e)), e
        );
      }
    },
    ye = class {
      constructor(t) {
        (this.application = t),
          (this.scopeObserver = new Fe(this.element, this.schema, this)),
          (this.scopesByIdentifier = new T()),
          (this.modulesByIdentifier = new Map());
      }
      get element() {
        return this.application.element;
      }
      get schema() {
        return this.application.schema;
      }
      get logger() {
        return this.application.logger;
      }
      get controllerAttribute() {
        return this.schema.controllerAttribute;
      }
      get modules() {
        return Array.from(this.modulesByIdentifier.values());
      }
      get contexts() {
        return this.modules.reduce((t, e) => t.concat(e.contexts), []);
      }
      start() {
        this.scopeObserver.start();
      }
      stop() {
        this.scopeObserver.stop();
      }
      loadDefinition(t) {
        this.unloadIdentifier(t.identifier);
        let e = new he(this.application, t);
        this.connectModule(e);
        let i = t.controllerConstructor.afterLoad;
        i && i.call(t.controllerConstructor, t.identifier, this.application);
      }
      unloadIdentifier(t) {
        let e = this.modulesByIdentifier.get(t);
        e && this.disconnectModule(e);
      }
      getContextForElementAndIdentifier(t, e) {
        let i = this.modulesByIdentifier.get(e);
        if (i) return i.contexts.find((n) => n.element == t);
      }
      proposeToConnectScopeForElementAndIdentifier(t, e) {
        let i = this.scopeObserver.parseValueForElementAndIdentifier(t, e);
        i
          ? this.scopeObserver.elementMatchedValue(i.element, i)
          : console.error(
              `Couldn't find or create scope for identifier: "${e}" and element:`,
              t,
            );
      }
      handleError(t, e, i) {
        this.application.handleError(t, e, i);
      }
      createScopeForElementAndIdentifier(t, e) {
        return new Qe(this.schema, t, e, this.logger);
      }
      scopeConnected(t) {
        this.scopesByIdentifier.add(t.identifier, t);
        let e = this.modulesByIdentifier.get(t.identifier);
        e && e.connectContextForScope(t);
      }
      scopeDisconnected(t) {
        this.scopesByIdentifier.delete(t.identifier, t);
        let e = this.modulesByIdentifier.get(t.identifier);
        e && e.disconnectContextForScope(t);
      }
      connectModule(t) {
        this.modulesByIdentifier.set(t.identifier, t),
          this.scopesByIdentifier
            .getValuesForKey(t.identifier)
            .forEach((i) => t.connectContextForScope(i));
      }
      disconnectModule(t) {
        this.modulesByIdentifier.delete(t.identifier),
          this.scopesByIdentifier
            .getValuesForKey(t.identifier)
            .forEach((i) => t.disconnectContextForScope(i));
      }
    },
    Cn = {
      controllerAttribute: "data-controller",
      actionAttribute: "data-action",
      targetAttribute: "data-target",
      targetAttributeForScope: (o) => `data-${o}-target`,
      outletAttributeForScope: (o, t) => `data-${o}-${t}-outlet`,
      keyMappings: Object.assign(
        Object.assign(
          {
            enter: "Enter",
            tab: "Tab",
            esc: "Escape",
            space: " ",
            up: "ArrowUp",
            down: "ArrowDown",
            left: "ArrowLeft",
            right: "ArrowRight",
            home: "Home",
            end: "End",
            page_up: "PageUp",
            page_down: "PageDown",
          },
          ti("abcdefghijklmnopqrstuvwxyz".split("").map((o) => [o, o])),
        ),
        ti("0123456789".split("").map((o) => [o, o])),
      ),
    };
  function ti(o) {
    return o.reduce(
      (t, [e, i]) => Object.assign(Object.assign({}, t), { [e]: i }),
      {},
    );
  }
  var Lt = class {
    constructor(t = document.documentElement, e = Cn) {
      (this.logger = console),
        (this.debug = !1),
        (this.logDebugActivity = (i, n, s = {}) => {
          this.debug && this.logFormattedMessage(i, n, s);
        }),
        (this.element = t),
        (this.schema = e),
        (this.dispatcher = new $t(this)),
        (this.router = new ye(this)),
        (this.actionDescriptorFilters = Object.assign({}, sn));
    }
    static start(t, e) {
      let i = new this(t, e);
      return i.start(), i;
    }
    async start() {
      await En(),
        this.logDebugActivity("application", "starting"),
        this.dispatcher.start(),
        this.router.start(),
        this.logDebugActivity("application", "start");
    }
    stop() {
      this.logDebugActivity("application", "stopping"),
        this.dispatcher.stop(),
        this.router.stop(),
        this.logDebugActivity("application", "stop");
    }
    register(t, e) {
      this.load({ identifier: t, controllerConstructor: e });
    }
    registerActionOption(t, e) {
      this.actionDescriptorFilters[t] = e;
    }
    load(t, ...e) {
      (Array.isArray(t) ? t : [t, ...e]).forEach((n) => {
        n.controllerConstructor.shouldLoad && this.router.loadDefinition(n);
      });
    }
    unload(t, ...e) {
      (Array.isArray(t) ? t : [t, ...e]).forEach((n) =>
        this.router.unloadIdentifier(n),
      );
    }
    get controllers() {
      return this.router.contexts.map((t) => t.controller);
    }
    getControllerForElementAndIdentifier(t, e) {
      let i = this.router.getContextForElementAndIdentifier(t, e);
      return i ? i.controller : null;
    }
    handleError(t, e, i) {
      var n;
      this.logger.error(
        `%s

%o

%o`,
        e,
        t,
        i,
      ),
        (n = window.onerror) === null ||
          n === void 0 ||
          n.call(window, e, "", 0, 0, t);
    }
    logFormattedMessage(t, e, i = {}) {
      (i = Object.assign({ application: this }, i)),
        this.logger.groupCollapsed(`${t} #${e}`),
        this.logger.log("details:", Object.assign({}, i)),
        this.logger.groupEnd();
    }
  };
  function En() {
    return new Promise((o) => {
      document.readyState == "loading"
        ? document.addEventListener("DOMContentLoaded", () => o())
        : o();
    });
  }
  function Mn(o) {
    return mt(o, "classes").reduce((e, i) => Object.assign(e, Dn(i)), {});
  }
  function Dn(o) {
    return {
      [`${o}Class`]: {
        get() {
          let { classes: t } = this;
          if (t.has(o)) return t.get(o);
          {
            let e = t.getAttributeName(o);
            throw new Error(`Missing attribute "${e}"`);
          }
        },
      },
      [`${o}Classes`]: {
        get() {
          return this.classes.getAll(o);
        },
      },
      [`has${ut(o)}Class`]: {
        get() {
          return this.classes.has(o);
        },
      },
    };
  }
  function Yn(o) {
    return mt(o, "outlets").reduce((e, i) => Object.assign(e, On(i)), {});
  }
  function ei(o, t, e) {
    return o.application.getControllerForElementAndIdentifier(t, e);
  }
  function ii(o, t, e) {
    let i = ei(o, t, e);
    if (
      i ||
      (o.application.router.proposeToConnectScopeForElementAndIdentifier(t, e),
      (i = ei(o, t, e)),
      i)
    )
      return i;
  }
  function On(o) {
    let t = te(o);
    return {
      [`${t}Outlet`]: {
        get() {
          let e = this.outlets.find(o),
            i = this.outlets.getSelectorForOutletName(o);
          if (e) {
            let n = ii(this, e, o);
            if (n) return n;
            throw new Error(
              `The provided outlet element is missing an outlet controller "${o}" instance for host controller "${this.identifier}"`,
            );
          }
          throw new Error(
            `Missing outlet element "${o}" for host controller "${this.identifier}". Stimulus couldn't find a matching outlet element using selector "${i}".`,
          );
        },
      },
      [`${t}Outlets`]: {
        get() {
          let e = this.outlets.findAll(o);
          return e.length > 0
            ? e
                .map((i) => {
                  let n = ii(this, i, o);
                  if (n) return n;
                  console.warn(
                    `The provided outlet element is missing an outlet controller "${o}" instance for host controller "${this.identifier}"`,
                    i,
                  );
                })
                .filter((i) => i)
            : [];
        },
      },
      [`${t}OutletElement`]: {
        get() {
          let e = this.outlets.find(o),
            i = this.outlets.getSelectorForOutletName(o);
          if (e) return e;
          throw new Error(
            `Missing outlet element "${o}" for host controller "${this.identifier}". Stimulus couldn't find a matching outlet element using selector "${i}".`,
          );
        },
      },
      [`${t}OutletElements`]: {
        get() {
          return this.outlets.findAll(o);
        },
      },
      [`has${ut(t)}Outlet`]: {
        get() {
          return this.outlets.has(o);
        },
      },
    };
  }
  function Nn(o) {
    return mt(o, "targets").reduce((e, i) => Object.assign(e, Rn(i)), {});
  }
  function Rn(o) {
    return {
      [`${o}Target`]: {
        get() {
          let t = this.targets.find(o);
          if (t) return t;
          throw new Error(
            `Missing target element "${o}" for "${this.identifier}" controller`,
          );
        },
      },
      [`${o}Targets`]: {
        get() {
          return this.targets.findAll(o);
        },
      },
      [`has${ut(o)}Target`]: {
        get() {
          return this.targets.has(o);
        },
      },
    };
  }
  function kn(o) {
    let t = Fn(o, "values"),
      e = {
        valueDescriptorMap: {
          get() {
            return t.reduce((i, n) => {
              let s = ci(n, this.identifier),
                a = this.data.getAttributeNameForKey(s.key);
              return Object.assign(i, { [a]: s });
            }, {});
          },
        },
      };
    return t.reduce((i, n) => Object.assign(i, Xn(n)), e);
  }
  function Xn(o, t) {
    let e = ci(o, t),
      { key: i, name: n, reader: s, writer: a } = e;
    return {
      [n]: {
        get() {
          let r = this.data.get(i);
          return r !== null ? s(r) : e.defaultValue;
        },
        set(r) {
          r === void 0 ? this.data.delete(i) : this.data.set(i, a(r));
        },
      },
      [`has${ut(n)}`]: {
        get() {
          return this.data.has(i) || e.hasCustomDefaultValue;
        },
      },
    };
  }
  function ci([o, t], e) {
    return Sn({ controller: e, token: o, typeDefinition: t });
  }
  function wt(o) {
    switch (o) {
      case Array:
        return "array";
      case Boolean:
        return "boolean";
      case Number:
        return "number";
      case Object:
        return "object";
      case String:
        return "string";
    }
  }
  function ht(o) {
    switch (typeof o) {
      case "boolean":
        return "boolean";
      case "number":
        return "number";
      case "string":
        return "string";
    }
    if (Array.isArray(o)) return "array";
    if (Object.prototype.toString.call(o) === "[object Object]")
      return "object";
  }
  function Gn(o) {
    let { controller: t, token: e, typeObject: i } = o,
      n = Ke(i.type),
      s = Ke(i.default),
      a = n && s,
      r = n && !s,
      l = !n && s,
      c = wt(i.type),
      d = ht(o.typeObject.default);
    if (r) return c;
    if (l) return d;
    if (c !== d) {
      let u = t ? `${t}.${e}` : e;
      throw new Error(
        `The specified default value for the Stimulus Value "${u}" must match the defined type "${c}". The provided default value of "${i.default}" is of type "${d}".`,
      );
    }
    if (a) return c;
  }
  function Vn(o) {
    let { controller: t, token: e, typeDefinition: i } = o,
      s = Gn({ controller: t, token: e, typeObject: i }),
      a = ht(i),
      r = wt(i),
      l = s || a || r;
    if (l) return l;
    let c = t ? `${t}.${i}` : e;
    throw new Error(`Unknown value type "${c}" for "${e}" value`);
  }
  function In(o) {
    let t = wt(o);
    if (t) return ni[t];
    let e = ee(o, "default"),
      i = ee(o, "type"),
      n = o;
    if (e) return n.default;
    if (i) {
      let { type: s } = n,
        a = wt(s);
      if (a) return ni[a];
    }
    return o;
  }
  function Sn(o) {
    let { token: t, typeDefinition: e } = o,
      i = `${ai(t)}-value`,
      n = Vn(o);
    return {
      type: n,
      key: i,
      name: ve(i),
      get defaultValue() {
        return In(e);
      },
      get hasCustomDefaultValue() {
        return ht(e) !== void 0;
      },
      reader: zn[n],
      writer: si[n] || si.default,
    };
  }
  var ni = {
      get array() {
        return [];
      },
      boolean: !1,
      number: 0,
      get object() {
        return {};
      },
      string: "",
    },
    zn = {
      array(o) {
        let t = JSON.parse(o);
        if (!Array.isArray(t))
          throw new TypeError(
            `expected value of type "array" but instead got value "${o}" of type "${ht(t)}"`,
          );
        return t;
      },
      boolean(o) {
        return !(o == "0" || String(o).toLowerCase() == "false");
      },
      number(o) {
        return Number(o.replace(/_/g, ""));
      },
      object(o) {
        let t = JSON.parse(o);
        if (t === null || typeof t != "object" || Array.isArray(t))
          throw new TypeError(
            `expected value of type "object" but instead got value "${o}" of type "${ht(t)}"`,
          );
        return t;
      },
      string(o) {
        return o;
      },
    },
    si = { default: Tn, array: oi, object: oi };
  function oi(o) {
    return JSON.stringify(o);
  }
  function Tn(o) {
    return `${o}`;
  }
  var V = class {
    constructor(t) {
      this.context = t;
    }
    static get shouldLoad() {
      return !0;
    }
    static afterLoad(t, e) {}
    get application() {
      return this.context.application;
    }
    get scope() {
      return this.context.scope;
    }
    get element() {
      return this.scope.element;
    }
    get identifier() {
      return this.scope.identifier;
    }
    get targets() {
      return this.scope.targets;
    }
    get outlets() {
      return this.scope.outlets;
    }
    get classes() {
      return this.scope.classes;
    }
    get data() {
      return this.scope.data;
    }
    initialize() {}
    connect() {}
    disconnect() {}
    dispatch(
      t,
      {
        target: e = this.element,
        detail: i = {},
        prefix: n = this.identifier,
        bubbles: s = !0,
        cancelable: a = !0,
      } = {},
    ) {
      let r = n ? `${n}:${t}` : t,
        l = new CustomEvent(r, { detail: i, bubbles: s, cancelable: a });
      return e.dispatchEvent(l), l;
    }
  };
  V.blessings = [Mn, Nn, kn, Yn];
  V.targets = [];
  V.outlets = [];
  V.values = {};
  var Be = {};
  _e(Be, { default: () => At });
  var At = class extends V {
    connect() {
      fetch(
        "https://files.thisisnotawebsitedotcom.com/is-it-time-yet/well-is-it.txt",
        { cache: "no-store" },
      )
        .then((o) => o.text())
        .then((o) => {
          o == "NO"
            ? (this.updateCountdown(),
              setInterval(this.updateCountdown.bind(this), 1e3))
            : o.includes("https")
              ? window.location.replace(o)
              : ((this.timeValue = o),
                this.updateCountdown(),
                setInterval(this.updateCountdown.bind(this), 1e3));
        });
    }
    updateCountdown() {
      let o = new Date().getTime(),
        t = new Date(this.timeValue).getTime(),
        e = !0,
        i = t - o,
        n = Math.floor(i / (1e3 * 60 * 60 * 24));
      n < 10 && n > 0 && (n = `0${n}`);
      let s = Math.floor((i % (1e3 * 60 * 60 * 24)) / (1e3 * 60 * 60));
      s < 10 && s > 0 && (s = `0${s}`);
      let a = Math.floor((i % (1e3 * 60 * 60)) / (1e3 * 60));
      a < 10 && a > 0 && (a = `0${a}`), a == 0 && (a = "00");
      let r = Math.floor((i % (1e3 * 60)) / 1e3);
      if ((r < 10 && r > 0 && (r = `0${r}`), e && i < 0)) {
        for (let l of document.querySelectorAll(".error"))
          l.classList.remove("hidden");
        this.element.innerHTML = `<div class='flex gap-x-2 items-center justify-center'>${n + 1 <= -1 ? "<span class='text-3xl whitespace-nowrap md:text-6xl w-8 md:w-16'>" + (n + 1) + "</span><span class='text-2xl md:text-5xl w-4 md:w-8'>:</span>" : ""}${n + 1 <= -1 || s + 1 <= -1 ? "<span class='text-3xl whitespace-nowrap md:text-6xl w-8 md:w-16'>" + (s + 1) + "</span><span class='text-2xl md:text-5xl w-4 md:w-8'>:</span>" : ""}<span class='text-3xl whitespace-nowrap md:text-6xl w-8 md:w-16'>${a}</span><span class='text-2xl md:text-5xl w-4 md:w-8'>:</span><span class='text-3xl whitespace-nowrap md:text-6xl w-8 md:w-16'>${r}</span></div>`;
      } else
        i < 0
          ? (this.element.innerHTML = "NOW<br/><small>(REFRESH)</small>")
          : (this.element.innerHTML = `<div class='flex gap-x-2 items-center justify-center'>${n > 0 ? "<span class='text-3xl whitespace-nowrap md:text-6xl w-8 md:w-16'>" + n + "</span><span class='text-2xl md:text-5xl w-4 md:w-8'>:</span>" : ""}${n > 0 || s > 0 ? "<span class='text-3xl whitespace-nowrap md:text-6xl w-8 md:w-16'>" + s + "</span><span class='text-2xl md:text-5xl w-4 md:w-8'>:</span>" : ""}<span class='text-3xl whitespace-nowrap md:text-6xl w-8 md:w-16'>${a}</span><span class='text-2xl md:text-5xl w-4 md:w-8'>:</span><span class='text-3xl whitespace-nowrap md:text-6xl w-8 md:w-16'>${r}</span></div>`);
    }
  };
  Ft(At, "values", { time: { type: String, default: "" } });
  var Te = {};
  _e(Te, { default: () => Kt });
  var Q = (o, t = 1e4) => (
      (o = parseFloat(o + "") || 0), Math.round((o + Number.EPSILON) * t) / t
    ),
    Xe = function (o) {
      if (!(o && o instanceof Element && o.offsetParent)) return !1;
      let t = o.scrollHeight > o.clientHeight,
        e = window.getComputedStyle(o).overflowY,
        i = e.indexOf("hidden") !== -1,
        n = e.indexOf("visible") !== -1;
      return t && !i && !n;
    },
    Gt = function (o, t = void 0) {
      return (
        !(!o || o === document.body || (t && o === t)) &&
        (Xe(o) ? o : Gt(o.parentElement, t))
      );
    },
    S = function (o) {
      var t = new DOMParser().parseFromString(o, "text/html").body;
      if (t.childElementCount > 1) {
        for (var e = document.createElement("div"); t.firstChild; )
          e.appendChild(t.firstChild);
        return e;
      }
      return t.firstChild;
    },
    Se = (o) => `${o || ""}`.split(" ").filter((t) => !!t),
    z = (o, t, e) => {
      o &&
        Se(t).forEach((i) => {
          o.classList.toggle(i, e || !1);
        });
    },
    K = class {
      constructor(t) {
        Object.defineProperty(this, "pageX", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: void 0,
        }),
          Object.defineProperty(this, "pageY", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: void 0,
          }),
          Object.defineProperty(this, "clientX", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: void 0,
          }),
          Object.defineProperty(this, "clientY", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: void 0,
          }),
          Object.defineProperty(this, "id", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: void 0,
          }),
          Object.defineProperty(this, "time", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: void 0,
          }),
          Object.defineProperty(this, "nativePointer", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: void 0,
          }),
          (this.nativePointer = t),
          (this.pageX = t.pageX),
          (this.pageY = t.pageY),
          (this.clientX = t.clientX),
          (this.clientY = t.clientY),
          (this.id = self.Touch && t instanceof Touch ? t.identifier : -1),
          (this.time = Date.now());
      }
    },
    st = { passive: !1 },
    Ge = class {
      constructor(
        t,
        { start: e = () => !0, move: i = () => {}, end: n = () => {} },
      ) {
        Object.defineProperty(this, "element", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: void 0,
        }),
          Object.defineProperty(this, "startCallback", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: void 0,
          }),
          Object.defineProperty(this, "moveCallback", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: void 0,
          }),
          Object.defineProperty(this, "endCallback", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: void 0,
          }),
          Object.defineProperty(this, "currentPointers", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: [],
          }),
          Object.defineProperty(this, "startPointers", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: [],
          }),
          (this.element = t),
          (this.startCallback = e),
          (this.moveCallback = i),
          (this.endCallback = n);
        for (let s of [
          "onPointerStart",
          "onTouchStart",
          "onMove",
          "onTouchEnd",
          "onPointerEnd",
          "onWindowBlur",
        ])
          this[s] = this[s].bind(this);
        this.element.addEventListener("mousedown", this.onPointerStart, st),
          this.element.addEventListener("touchstart", this.onTouchStart, st),
          this.element.addEventListener("touchmove", this.onMove, st),
          this.element.addEventListener("touchend", this.onTouchEnd),
          this.element.addEventListener("touchcancel", this.onTouchEnd);
      }
      onPointerStart(t) {
        if (!t.buttons || t.button !== 0) return;
        let e = new K(t);
        this.currentPointers.some((i) => i.id === e.id) ||
          (this.triggerPointerStart(e, t) &&
            (window.addEventListener("mousemove", this.onMove),
            window.addEventListener("mouseup", this.onPointerEnd),
            window.addEventListener("blur", this.onWindowBlur)));
      }
      onTouchStart(t) {
        for (let e of Array.from(t.changedTouches || []))
          this.triggerPointerStart(new K(e), t);
        window.addEventListener("blur", this.onWindowBlur);
      }
      onMove(t) {
        let e = this.currentPointers.slice(),
          i =
            "changedTouches" in t
              ? Array.from(t.changedTouches || []).map((s) => new K(s))
              : [new K(t)],
          n = [];
        for (let s of i) {
          let a = this.currentPointers.findIndex((r) => r.id === s.id);
          a < 0 || (n.push(s), (this.currentPointers[a] = s));
        }
        n.length && this.moveCallback(t, this.currentPointers.slice(), e);
      }
      onPointerEnd(t) {
        (t.buttons > 0 && t.button !== 0) ||
          (this.triggerPointerEnd(t, new K(t)),
          window.removeEventListener("mousemove", this.onMove),
          window.removeEventListener("mouseup", this.onPointerEnd),
          window.removeEventListener("blur", this.onWindowBlur));
      }
      onTouchEnd(t) {
        for (let e of Array.from(t.changedTouches || []))
          this.triggerPointerEnd(t, new K(e));
      }
      triggerPointerStart(t, e) {
        return (
          !!this.startCallback(e, t, this.currentPointers.slice()) &&
          (this.currentPointers.push(t), this.startPointers.push(t), !0)
        );
      }
      triggerPointerEnd(t, e) {
        let i = this.currentPointers.findIndex((n) => n.id === e.id);
        i < 0 ||
          (this.currentPointers.splice(i, 1),
          this.startPointers.splice(i, 1),
          this.endCallback(t, e, this.currentPointers.slice()));
      }
      onWindowBlur() {
        this.clear();
      }
      clear() {
        for (; this.currentPointers.length; ) {
          let t = this.currentPointers[this.currentPointers.length - 1];
          this.currentPointers.splice(this.currentPointers.length - 1, 1),
            this.startPointers.splice(this.currentPointers.length - 1, 1),
            this.endCallback(
              new Event("touchend", {
                bubbles: !0,
                cancelable: !0,
                clientX: t.clientX,
                clientY: t.clientY,
              }),
              t,
              this.currentPointers.slice(),
            );
        }
      }
      stop() {
        this.element.removeEventListener("mousedown", this.onPointerStart, st),
          this.element.removeEventListener("touchstart", this.onTouchStart, st),
          this.element.removeEventListener("touchmove", this.onMove, st),
          this.element.removeEventListener("touchend", this.onTouchEnd),
          this.element.removeEventListener("touchcancel", this.onTouchEnd),
          window.removeEventListener("mousemove", this.onMove),
          window.removeEventListener("mouseup", this.onPointerEnd),
          window.removeEventListener("blur", this.onWindowBlur);
      }
    };
  function di(o, t) {
    return t
      ? Math.sqrt(
          Math.pow(t.clientX - o.clientX, 2) +
            Math.pow(t.clientY - o.clientY, 2),
        )
      : 0;
  }
  function hi(o, t) {
    return t
      ? {
          clientX: (o.clientX + t.clientX) / 2,
          clientY: (o.clientY + t.clientY) / 2,
        }
      : o;
  }
  var Ve = (o) =>
      typeof o == "object" &&
      o !== null &&
      o.constructor === Object &&
      Object.prototype.toString.call(o) === "[object Object]",
    E = (o, ...t) => {
      let e = t.length;
      for (let i = 0; i < e; i++) {
        let n = t[i] || {};
        Object.entries(n).forEach(([s, a]) => {
          let r = Array.isArray(a) ? [] : {};
          o[s] || Object.assign(o, { [s]: r }),
            Ve(a)
              ? Object.assign(o[s], E(r, a))
              : Array.isArray(a)
                ? Object.assign(o, { [s]: [...a] })
                : Object.assign(o, { [s]: a });
        });
      }
      return o;
    },
    xe = function (o, t) {
      return o
        .split(".")
        .reduce((e, i) => (typeof e == "object" ? e[i] : void 0), t);
    },
    dt = class {
      constructor(t = {}) {
        Object.defineProperty(this, "options", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: t,
        }),
          Object.defineProperty(this, "events", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: new Map(),
          }),
          this.setOptions(t);
        for (let e of Object.getOwnPropertyNames(Object.getPrototypeOf(this)))
          e.startsWith("on") &&
            typeof this[e] == "function" &&
            (this[e] = this[e].bind(this));
      }
      setOptions(t) {
        this.options = t ? E({}, this.constructor.defaults, t) : {};
        for (let [e, i] of Object.entries(this.option("on") || {}))
          this.on(e, i);
      }
      option(t, ...e) {
        let i = xe(t, this.options);
        return i && typeof i == "function" && (i = i.call(this, this, ...e)), i;
      }
      optionFor(t, e, i, ...n) {
        let s = xe(e, t);
        var a;
        typeof (a = s) != "string" ||
          isNaN(a) ||
          isNaN(parseFloat(a)) ||
          (s = parseFloat(s)),
          s === "true" && (s = !0),
          s === "false" && (s = !1),
          s && typeof s == "function" && (s = s.call(this, this, t, ...n));
        let r = xe(e, this.options);
        return (
          r && typeof r == "function"
            ? (s = r.call(this, this, t, ...n, s))
            : s === void 0 && (s = r),
          s === void 0 ? i : s
        );
      }
      cn(t) {
        let e = this.options.classes;
        return (e && e[t]) || "";
      }
      localize(t, e = []) {
        t = String(t).replace(/\{\{(\w+).?(\w+)?\}\}/g, (i, n, s) => {
          let a = "";
          return (
            s
              ? (a = this.option(
                  `${n[0] + n.toLowerCase().substring(1)}.l10n.${s}`,
                ))
              : n && (a = this.option(`l10n.${n}`)),
            a || (a = i),
            a
          );
        });
        for (let i = 0; i < e.length; i++) t = t.split(e[i][0]).join(e[i][1]);
        return (t = t.replace(/\{\{(.*?)\}\}/g, (i, n) => n));
      }
      on(t, e) {
        let i = [];
        typeof t == "string" ? (i = t.split(" ")) : Array.isArray(t) && (i = t),
          this.events || (this.events = new Map()),
          i.forEach((n) => {
            let s = this.events.get(n);
            s || (this.events.set(n, []), (s = [])),
              s.includes(e) || s.push(e),
              this.events.set(n, s);
          });
      }
      off(t, e) {
        let i = [];
        typeof t == "string" ? (i = t.split(" ")) : Array.isArray(t) && (i = t),
          i.forEach((n) => {
            let s = this.events.get(n);
            if (Array.isArray(s)) {
              let a = s.indexOf(e);
              a > -1 && s.splice(a, 1);
            }
          });
      }
      emit(t, ...e) {
        [...(this.events.get(t) || [])].forEach((i) => i(this, ...e)),
          t !== "*" && this.emit("*", t, ...e);
      }
    };
  Object.defineProperty(dt, "version", {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: "5.0.36",
  }),
    Object.defineProperty(dt, "defaults", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: {},
    });
  var Qt = class extends dt {
      constructor(t = {}) {
        super(t),
          Object.defineProperty(this, "plugins", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: {},
          });
      }
      attachPlugins(t = {}) {
        let e = new Map();
        for (let [i, n] of Object.entries(t)) {
          let s = this.option(i),
            a = this.plugins[i];
          a || s === !1
            ? a && s === !1 && (a.detach(), delete this.plugins[i])
            : e.set(i, new n(this, s || {}));
        }
        for (let [i, n] of e) (this.plugins[i] = n), n.attach();
      }
      detachPlugins(t) {
        t = t || Object.keys(this.plugins);
        for (let e of t) {
          let i = this.plugins[e];
          i && i.detach(), delete this.plugins[e];
        }
        return this.emit("detachPlugins"), this;
      }
    },
    U;
  (function (o) {
    (o[(o.Init = 0)] = "Init"),
      (o[(o.Error = 1)] = "Error"),
      (o[(o.Ready = 2)] = "Ready"),
      (o[(o.Panning = 3)] = "Panning"),
      (o[(o.Mousemove = 4)] = "Mousemove"),
      (o[(o.Destroy = 5)] = "Destroy");
  })(U || (U = {}));
  var j = ["a", "b", "c", "d", "e", "f"],
    Xi = {
      PANUP: "Move up",
      PANDOWN: "Move down",
      PANLEFT: "Move left",
      PANRIGHT: "Move right",
      ZOOMIN: "Zoom in",
      ZOOMOUT: "Zoom out",
      TOGGLEZOOM: "Toggle zoom level",
      TOGGLE1TO1: "Toggle zoom level",
      ITERATEZOOM: "Toggle zoom level",
      ROTATECCW: "Rotate counterclockwise",
      ROTATECW: "Rotate clockwise",
      FLIPX: "Flip horizontally",
      FLIPY: "Flip vertically",
      FITX: "Fit horizontally",
      FITY: "Fit vertically",
      RESET: "Reset",
      TOGGLEFS: "Toggle fullscreen",
    },
    jn = {
      content: null,
      width: "auto",
      height: "auto",
      panMode: "drag",
      touch: !0,
      dragMinThreshold: 3,
      lockAxis: !1,
      mouseMoveFactor: 1,
      mouseMoveFriction: 0.12,
      zoom: !0,
      pinchToZoom: !0,
      panOnlyZoomed: "auto",
      minScale: 1,
      maxScale: 2,
      friction: 0.25,
      dragFriction: 0.35,
      decelFriction: 0.05,
      click: "toggleZoom",
      dblClick: !1,
      wheel: "zoom",
      wheelLimit: 7,
      spinner: !0,
      bounds: "auto",
      infinite: !1,
      rubberband: !0,
      bounce: !0,
      maxVelocity: 75,
      transformParent: !1,
      classes: {
        content: "f-panzoom__content",
        isLoading: "is-loading",
        canZoomIn: "can-zoom_in",
        canZoomOut: "can-zoom_out",
        isDraggable: "is-draggable",
        isDragging: "is-dragging",
        inFullscreen: "in-fullscreen",
        htmlHasFullscreen: "with-panzoom-in-fullscreen",
      },
      l10n: Xi,
    },
    ui = '<circle cx="25" cy="25" r="20"></circle>',
    ze =
      '<div class="f-spinner"><svg viewBox="0 0 50 50">' +
      ui +
      ui +
      "</svg></div>",
    C = (o) => o && o !== null && o instanceof Element && "nodeType" in o,
    x = (o, t) => {
      o &&
        Se(t).forEach((e) => {
          o.classList.remove(e);
        });
    },
    y = (o, t) => {
      o &&
        Se(t).forEach((e) => {
          o.classList.add(e);
        });
    },
    Wt = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 },
    Jn = 1e5,
    Zt = 1e4,
    Y = "mousemove",
    mi = "drag",
    bi = "content",
    O = "auto",
    Ue = null,
    Le = null,
    nt = class o extends Qt {
      get fits() {
        return (
          this.contentRect.width - this.contentRect.fitWidth < 1 &&
          this.contentRect.height - this.contentRect.fitHeight < 1
        );
      }
      get isTouchDevice() {
        return (
          Le === null && (Le = window.matchMedia("(hover: none)").matches), Le
        );
      }
      get isMobile() {
        return (
          Ue === null &&
            (Ue = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)),
          Ue
        );
      }
      get panMode() {
        return this.options.panMode !== Y || this.isTouchDevice ? mi : Y;
      }
      get panOnlyZoomed() {
        let t = this.options.panOnlyZoomed;
        return t === O ? this.isTouchDevice : t;
      }
      get isInfinite() {
        return this.option("infinite");
      }
      get angle() {
        return (
          (180 * Math.atan2(this.current.b, this.current.a)) / Math.PI || 0
        );
      }
      get targetAngle() {
        return (180 * Math.atan2(this.target.b, this.target.a)) / Math.PI || 0;
      }
      get scale() {
        let { a: t, b: e } = this.current;
        return Math.sqrt(t * t + e * e) || 1;
      }
      get targetScale() {
        let { a: t, b: e } = this.target;
        return Math.sqrt(t * t + e * e) || 1;
      }
      get minScale() {
        return this.option("minScale") || 1;
      }
      get fullScale() {
        let { contentRect: t } = this;
        return t.fullWidth / t.fitWidth || 1;
      }
      get maxScale() {
        return this.fullScale * (this.option("maxScale") || 1) || 1;
      }
      get coverScale() {
        let { containerRect: t, contentRect: e } = this,
          i = Math.max(t.height / e.fitHeight, t.width / e.fitWidth) || 1;
        return Math.min(this.fullScale, i);
      }
      get isScaling() {
        return (
          Math.abs(this.targetScale - this.scale) > 1e-5 && !this.isResting
        );
      }
      get isContentLoading() {
        let t = this.content;
        return !!(t && t instanceof HTMLImageElement) && !t.complete;
      }
      get isResting() {
        if (this.isBouncingX || this.isBouncingY) return !1;
        for (let t of j) {
          let e = t == "e" || t === "f" ? 1e-4 : 1e-5;
          if (Math.abs(this.target[t] - this.current[t]) > e) return !1;
        }
        return !(!this.ignoreBounds && !this.checkBounds().inBounds);
      }
      constructor(t, e = {}, i = {}) {
        var n;
        if (
          (super(e),
          Object.defineProperty(this, "pointerTracker", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: null,
          }),
          Object.defineProperty(this, "resizeObserver", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: null,
          }),
          Object.defineProperty(this, "updateTimer", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: null,
          }),
          Object.defineProperty(this, "clickTimer", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: null,
          }),
          Object.defineProperty(this, "rAF", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: null,
          }),
          Object.defineProperty(this, "isTicking", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: !1,
          }),
          Object.defineProperty(this, "ignoreBounds", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: !1,
          }),
          Object.defineProperty(this, "isBouncingX", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: !1,
          }),
          Object.defineProperty(this, "isBouncingY", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: !1,
          }),
          Object.defineProperty(this, "clicks", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: 0,
          }),
          Object.defineProperty(this, "trackingPoints", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: [],
          }),
          Object.defineProperty(this, "pwt", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: 0,
          }),
          Object.defineProperty(this, "cwd", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: 0,
          }),
          Object.defineProperty(this, "pmme", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: void 0,
          }),
          Object.defineProperty(this, "friction", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: 0,
          }),
          Object.defineProperty(this, "state", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: U.Init,
          }),
          Object.defineProperty(this, "isDragging", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: !1,
          }),
          Object.defineProperty(this, "container", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: void 0,
          }),
          Object.defineProperty(this, "content", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: void 0,
          }),
          Object.defineProperty(this, "spinner", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: null,
          }),
          Object.defineProperty(this, "containerRect", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: { width: 0, height: 0, innerWidth: 0, innerHeight: 0 },
          }),
          Object.defineProperty(this, "contentRect", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: {
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              fullWidth: 0,
              fullHeight: 0,
              fitWidth: 0,
              fitHeight: 0,
              width: 0,
              height: 0,
            },
          }),
          Object.defineProperty(this, "dragStart", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: { x: 0, y: 0, top: 0, left: 0, time: 0 },
          }),
          Object.defineProperty(this, "dragOffset", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: { x: 0, y: 0, time: 0 },
          }),
          Object.defineProperty(this, "current", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: Object.assign({}, Wt),
          }),
          Object.defineProperty(this, "target", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: Object.assign({}, Wt),
          }),
          Object.defineProperty(this, "velocity", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: { a: 0, b: 0, c: 0, d: 0, e: 0, f: 0 },
          }),
          Object.defineProperty(this, "lockedAxis", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: !1,
          }),
          !t)
        )
          throw new Error("Container Element Not Found");
        (this.container = t),
          this.initContent(),
          this.attachPlugins(Object.assign(Object.assign({}, o.Plugins), i)),
          this.emit("attachPlugins"),
          this.emit("init");
        let s = this.content;
        if (
          (s.addEventListener("load", this.onLoad),
          s.addEventListener("error", this.onError),
          this.isContentLoading)
        ) {
          if (this.option("spinner")) {
            t.classList.add(this.cn("isLoading"));
            let a = S(ze);
            !t.contains(s) || s.parentElement instanceof HTMLPictureElement
              ? (this.spinner = t.appendChild(a))
              : (this.spinner =
                  ((n = s.parentElement) === null || n === void 0
                    ? void 0
                    : n.insertBefore(a, s)) || null);
          }
          this.emit("beforeLoad");
        } else
          queueMicrotask(() => {
            this.enable();
          });
      }
      initContent() {
        let { container: t } = this,
          e = this.cn(bi),
          i = this.option(bi) || t.querySelector(`.${e}`);
        if (
          (i ||
            ((i = t.querySelector("img,picture") || t.firstElementChild),
            i && y(i, e)),
          i instanceof HTMLPictureElement && (i = i.querySelector("img")),
          !i)
        )
          throw new Error("No content found");
        this.content = i;
      }
      onLoad() {
        let { spinner: t, container: e, state: i } = this;
        t && (t.remove(), (this.spinner = null)),
          this.option("spinner") && e.classList.remove(this.cn("isLoading")),
          this.emit("afterLoad"),
          i === U.Init ? this.enable() : this.updateMetrics();
      }
      onError() {
        this.state !== U.Destroy &&
          (this.spinner && (this.spinner.remove(), (this.spinner = null)),
          this.stop(),
          this.detachEvents(),
          (this.state = U.Error),
          this.emit("error"));
      }
      getNextScale(t) {
        let {
            fullScale: e,
            targetScale: i,
            coverScale: n,
            maxScale: s,
            minScale: a,
          } = this,
          r = a;
        switch (t) {
          case "toggleMax":
            r = i - a < 0.5 * (s - a) ? s : a;
            break;
          case "toggleCover":
            r = i - a < 0.5 * (n - a) ? n : a;
            break;
          case "toggleZoom":
            r = i - a < 0.5 * (e - a) ? e : a;
            break;
          case "iterateZoom":
            let l = [1, e, s].sort((d, u) => d - u),
              c = l.findIndex((d) => d > i + 1e-5);
            r = l[c] || 1;
        }
        return r;
      }
      attachObserver() {
        var t;
        let e = () => {
          let { container: i, containerRect: n } = this;
          return (
            Math.abs(n.width - i.getBoundingClientRect().width) > 0.1 ||
            Math.abs(n.height - i.getBoundingClientRect().height) > 0.1
          );
        };
        this.resizeObserver ||
          window.ResizeObserver === void 0 ||
          (this.resizeObserver = new ResizeObserver(() => {
            this.updateTimer ||
              (e()
                ? (this.onResize(),
                  this.isMobile &&
                    (this.updateTimer = setTimeout(() => {
                      e() && this.onResize(), (this.updateTimer = null);
                    }, 500)))
                : this.updateTimer &&
                  (clearTimeout(this.updateTimer), (this.updateTimer = null)));
          })),
          (t = this.resizeObserver) === null ||
            t === void 0 ||
            t.observe(this.container);
      }
      detachObserver() {
        var t;
        (t = this.resizeObserver) === null || t === void 0 || t.disconnect();
      }
      attachEvents() {
        let { container: t } = this;
        t.addEventListener("click", this.onClick, { passive: !1, capture: !1 }),
          t.addEventListener("wheel", this.onWheel, { passive: !1 }),
          (this.pointerTracker = new Ge(t, {
            start: this.onPointerDown,
            move: this.onPointerMove,
            end: this.onPointerUp,
          })),
          document.addEventListener(Y, this.onMouseMove);
      }
      detachEvents() {
        var t;
        let { container: e } = this;
        e.removeEventListener("click", this.onClick, {
          passive: !1,
          capture: !1,
        }),
          e.removeEventListener("wheel", this.onWheel, { passive: !1 }),
          (t = this.pointerTracker) === null || t === void 0 || t.stop(),
          (this.pointerTracker = null),
          document.removeEventListener(Y, this.onMouseMove),
          document.removeEventListener("keydown", this.onKeydown, !0),
          this.clickTimer &&
            (clearTimeout(this.clickTimer), (this.clickTimer = null)),
          this.updateTimer &&
            (clearTimeout(this.updateTimer), (this.updateTimer = null));
      }
      animate() {
        this.setTargetForce();
        let t = this.friction,
          e = this.option("maxVelocity");
        for (let i of j)
          t
            ? ((this.velocity[i] *= 1 - t),
              e &&
                !this.isScaling &&
                (this.velocity[i] = Math.max(
                  Math.min(this.velocity[i], e),
                  -1 * e,
                )),
              (this.current[i] += this.velocity[i]))
            : (this.current[i] = this.target[i]);
        this.setTransform(),
          this.setEdgeForce(),
          !this.isResting || this.isDragging
            ? (this.rAF = requestAnimationFrame(() => this.animate()))
            : this.stop("current");
      }
      setTargetForce() {
        for (let t of j)
          (t === "e" && this.isBouncingX) ||
            (t === "f" && this.isBouncingY) ||
            (this.velocity[t] =
              (1 / (1 - this.friction) - 1) *
              (this.target[t] - this.current[t]));
      }
      checkBounds(t = 0, e = 0) {
        let { current: i } = this,
          n = i.e + t,
          s = i.f + e,
          a = this.getBounds(),
          { x: r, y: l } = a,
          c = r.min,
          d = r.max,
          u = l.min,
          m = l.max,
          h = 0,
          b = 0;
        return (
          c !== 1 / 0 && n < c
            ? (h = c - n)
            : d !== 1 / 0 && n > d && (h = d - n),
          u !== 1 / 0 && s < u
            ? (b = u - s)
            : m !== 1 / 0 && s > m && (b = m - s),
          Math.abs(h) < 1e-4 && (h = 0),
          Math.abs(b) < 1e-4 && (b = 0),
          Object.assign(Object.assign({}, a), {
            xDiff: h,
            yDiff: b,
            inBounds: !h && !b,
          })
        );
      }
      clampTargetBounds() {
        let { target: t } = this,
          { x: e, y: i } = this.getBounds();
        e.min !== 1 / 0 && (t.e = Math.max(t.e, e.min)),
          e.max !== 1 / 0 && (t.e = Math.min(t.e, e.max)),
          i.min !== 1 / 0 && (t.f = Math.max(t.f, i.min)),
          i.max !== 1 / 0 && (t.f = Math.min(t.f, i.max));
      }
      calculateContentDim(t = this.current) {
        let { content: e, contentRect: i } = this,
          { fitWidth: n, fitHeight: s, fullWidth: a, fullHeight: r } = i,
          l = a,
          c = r;
        if (this.option("zoom") || this.angle !== 0) {
          let d =
              !(e instanceof HTMLImageElement) &&
              (window.getComputedStyle(e).maxWidth === "none" ||
                window.getComputedStyle(e).maxHeight === "none"),
            u = d ? a : n,
            m = d ? r : s,
            h = this.getMatrix(t),
            b = new DOMPoint(0, 0).matrixTransform(h),
            p = new DOMPoint(0 + u, 0).matrixTransform(h),
            f = new DOMPoint(0 + u, 0 + m).matrixTransform(h),
            g = new DOMPoint(0, 0 + m).matrixTransform(h),
            F = Math.abs(f.x - b.x),
            v = Math.abs(f.y - b.y),
            B = Math.abs(g.x - p.x),
            k = Math.abs(g.y - p.y);
          (l = Math.max(F, B)), (c = Math.max(v, k));
        }
        return { contentWidth: l, contentHeight: c };
      }
      setEdgeForce() {
        if (
          this.ignoreBounds ||
          this.isDragging ||
          this.panMode === Y ||
          this.targetScale < this.scale
        )
          return (this.isBouncingX = !1), void (this.isBouncingY = !1);
        let { target: t } = this,
          { x: e, y: i, xDiff: n, yDiff: s } = this.checkBounds(),
          a = this.option("maxVelocity"),
          r = this.velocity.e,
          l = this.velocity.f;
        n !== 0
          ? ((this.isBouncingX = !0),
            n * r <= 0
              ? (r += 0.14 * n)
              : ((r = 0.14 * n),
                e.min !== 1 / 0 && (this.target.e = Math.max(t.e, e.min)),
                e.max !== 1 / 0 && (this.target.e = Math.min(t.e, e.max))),
            a && (r = Math.max(Math.min(r, a), -1 * a)))
          : (this.isBouncingX = !1),
          s !== 0
            ? ((this.isBouncingY = !0),
              s * l <= 0
                ? (l += 0.14 * s)
                : ((l = 0.14 * s),
                  i.min !== 1 / 0 && (this.target.f = Math.max(t.f, i.min)),
                  i.max !== 1 / 0 && (this.target.f = Math.min(t.f, i.max))),
              a && (l = Math.max(Math.min(l, a), -1 * a)))
            : (this.isBouncingY = !1),
          this.isBouncingX && (this.velocity.e = r),
          this.isBouncingY && (this.velocity.f = l);
      }
      enable() {
        let { content: t } = this,
          e = new DOMMatrixReadOnly(window.getComputedStyle(t).transform);
        for (let i of j) this.current[i] = this.target[i] = e[i];
        this.updateMetrics(),
          this.attachObserver(),
          this.attachEvents(),
          (this.state = U.Ready),
          this.emit("ready");
      }
      onClick(t) {
        var e;
        t.type === "click" &&
          t.detail === 0 &&
          ((this.dragOffset.x = 0), (this.dragOffset.y = 0)),
          this.isDragging &&
            ((e = this.pointerTracker) === null || e === void 0 || e.clear(),
            (this.trackingPoints = []),
            this.startDecelAnim());
        let i = t.target;
        if (!i || t.defaultPrevented) return;
        if (i.hasAttribute("disabled"))
          return t.preventDefault(), void t.stopPropagation();
        if (
          (() => {
            let h = window.getSelection();
            return h && h.type === "Range";
          })() &&
          !i.closest("button")
        )
          return;
        let n = i.closest("[data-panzoom-action]"),
          s = i.closest("[data-panzoom-change]"),
          a = n || s,
          r = a && C(a) ? a.dataset : null;
        if (r) {
          let h = r.panzoomChange,
            b = r.panzoomAction;
          if (((h || b) && t.preventDefault(), h)) {
            let p = {};
            try {
              p = JSON.parse(h);
            } catch {
              console && console.warn("The given data was not valid JSON");
            }
            return void this.applyChange(p);
          }
          if (b) return void (this[b] && this[b]());
        }
        if (Math.abs(this.dragOffset.x) > 3 || Math.abs(this.dragOffset.y) > 3)
          return t.preventDefault(), void t.stopPropagation();
        if (i.closest("[data-fancybox]")) return;
        let l = this.content.getBoundingClientRect(),
          c = this.dragStart;
        if (
          c.time &&
          !this.canZoomOut() &&
          (Math.abs(l.x - c.x) > 2 || Math.abs(l.y - c.y) > 2)
        )
          return;
        this.dragStart.time = 0;
        let d = (h) => {
            this.option("zoom", t) &&
              h &&
              typeof h == "string" &&
              /(iterateZoom)|(toggle(Zoom|Full|Cover|Max)|(zoomTo(Fit|Cover|Max)))/.test(
                h,
              ) &&
              typeof this[h] == "function" &&
              (t.preventDefault(), this[h]({ event: t }));
          },
          u = this.option("click", t),
          m = this.option("dblClick", t);
        m
          ? (this.clicks++,
            this.clicks == 1 &&
              (this.clickTimer = setTimeout(() => {
                this.clicks === 1
                  ? (this.emit("click", t), !t.defaultPrevented && u && d(u))
                  : (this.emit("dblClick", t), t.defaultPrevented || d(m)),
                  (this.clicks = 0),
                  (this.clickTimer = null);
              }, 350)))
          : (this.emit("click", t), !t.defaultPrevented && u && d(u));
      }
      addTrackingPoint(t) {
        let e = this.trackingPoints.filter((i) => i.time > Date.now() - 100);
        e.push(t), (this.trackingPoints = e);
      }
      onPointerDown(t, e, i) {
        var n;
        if (this.option("touch", t) === !1) return !1;
        (this.pwt = 0),
          (this.dragOffset = { x: 0, y: 0, time: 0 }),
          (this.trackingPoints = []);
        let s = this.content.getBoundingClientRect();
        if (
          ((this.dragStart = {
            x: s.x,
            y: s.y,
            top: s.top,
            left: s.left,
            time: Date.now(),
          }),
          this.clickTimer)
        )
          return !1;
        if (this.panMode === Y && this.targetScale > 1)
          return t.preventDefault(), t.stopPropagation(), !1;
        let a = t.composedPath()[0];
        if (!i.length) {
          if (
            [
              "TEXTAREA",
              "OPTION",
              "INPUT",
              "SELECT",
              "VIDEO",
              "IFRAME",
            ].includes(a.nodeName) ||
            a.closest(
              "[contenteditable],[data-selectable],[data-draggable],[data-clickable],[data-panzoom-change],[data-panzoom-action]",
            )
          )
            return !1;
          (n = window.getSelection()) === null ||
            n === void 0 ||
            n.removeAllRanges();
        }
        if (t.type === "mousedown")
          ["A", "BUTTON"].includes(a.nodeName) || t.preventDefault();
        else if (Math.abs(this.velocity.a) > 0.3) return !1;
        return (
          (this.target.e = this.current.e),
          (this.target.f = this.current.f),
          this.stop(),
          this.isDragging ||
            ((this.isDragging = !0),
            this.addTrackingPoint(e),
            this.emit("touchStart", t)),
          !0
        );
      }
      onPointerMove(t, e, i) {
        if (
          this.option("touch", t) === !1 ||
          !this.isDragging ||
          (e.length < 2 &&
            this.panOnlyZoomed &&
            Q(this.targetScale) <= Q(this.minScale)) ||
          (this.emit("touchMove", t), t.defaultPrevented)
        )
          return;
        this.addTrackingPoint(e[0]);
        let { content: n } = this,
          s = hi(i[0], i[1]),
          a = hi(e[0], e[1]),
          r = 0,
          l = 0;
        if (e.length > 1) {
          let v = n.getBoundingClientRect();
          (r = s.clientX - v.left - 0.5 * v.width),
            (l = s.clientY - v.top - 0.5 * v.height);
        }
        let c = di(i[0], i[1]),
          d = di(e[0], e[1]),
          u = c ? d / c : 1,
          m = a.clientX - s.clientX,
          h = a.clientY - s.clientY;
        (this.dragOffset.x += m),
          (this.dragOffset.y += h),
          (this.dragOffset.time = Date.now() - this.dragStart.time);
        let b =
          Q(this.targetScale) === Q(this.minScale) && this.option("lockAxis");
        if (b && !this.lockedAxis)
          if (b === "xy" || b === "y" || t.type === "touchmove") {
            if (
              Math.abs(this.dragOffset.x) < 6 &&
              Math.abs(this.dragOffset.y) < 6
            )
              return void t.preventDefault();
            let v = Math.abs(
              (180 * Math.atan2(this.dragOffset.y, this.dragOffset.x)) /
                Math.PI,
            );
            (this.lockedAxis = v > 45 && v < 135 ? "y" : "x"),
              (this.dragOffset.x = 0),
              (this.dragOffset.y = 0),
              (m = 0),
              (h = 0);
          } else this.lockedAxis = b;
        if (
          (Gt(t.target, this.content) && ((b = "x"), (this.dragOffset.y = 0)),
          b &&
            b !== "xy" &&
            this.lockedAxis !== b &&
            Q(this.targetScale) === Q(this.minScale))
        )
          return;
        t.cancelable && t.preventDefault(),
          this.container.classList.add(this.cn("isDragging"));
        let p = this.checkBounds(m, h);
        this.option("rubberband")
          ? (this.isInfinite !== "x" &&
              ((p.xDiff > 0 && m < 0) || (p.xDiff < 0 && m > 0)) &&
              (m *= Math.max(
                0,
                0.5 - Math.abs((0.75 / this.contentRect.fitWidth) * p.xDiff),
              )),
            this.isInfinite !== "y" &&
              ((p.yDiff > 0 && h < 0) || (p.yDiff < 0 && h > 0)) &&
              (h *= Math.max(
                0,
                0.5 - Math.abs((0.75 / this.contentRect.fitHeight) * p.yDiff),
              )))
          : (p.xDiff && (m = 0), p.yDiff && (h = 0));
        let f = this.targetScale,
          g = this.minScale,
          F = this.maxScale;
        f < 0.5 * g && (u = Math.max(u, g)),
          f > 1.5 * F && (u = Math.min(u, F)),
          this.lockedAxis === "y" && Q(f) === Q(g) && (m = 0),
          this.lockedAxis === "x" && Q(f) === Q(g) && (h = 0),
          this.applyChange({
            originX: r,
            originY: l,
            panX: m,
            panY: h,
            scale: u,
            friction: this.option("dragFriction"),
            ignoreBounds: !0,
          });
      }
      onPointerUp(t, e, i) {
        if (i.length)
          return (
            (this.dragOffset.x = 0),
            (this.dragOffset.y = 0),
            void (this.trackingPoints = [])
          );
        this.container.classList.remove(this.cn("isDragging")),
          this.isDragging &&
            (this.addTrackingPoint(e),
            this.panOnlyZoomed &&
              this.contentRect.width - this.contentRect.fitWidth < 1 &&
              this.contentRect.height - this.contentRect.fitHeight < 1 &&
              (this.trackingPoints = []),
            Gt(t.target, this.content) &&
              this.lockedAxis === "y" &&
              (this.trackingPoints = []),
            this.emit("touchEnd", t),
            (this.isDragging = !1),
            (this.lockedAxis = !1),
            this.state !== U.Destroy &&
              (t.defaultPrevented || this.startDecelAnim()));
      }
      startDecelAnim() {
        var t;
        let e = this.isScaling;
        this.rAF && (cancelAnimationFrame(this.rAF), (this.rAF = null)),
          (this.isBouncingX = !1),
          (this.isBouncingY = !1);
        for (let v of j) this.velocity[v] = 0;
        (this.target.e = this.current.e),
          (this.target.f = this.current.f),
          x(this.container, "is-scaling"),
          x(this.container, "is-animating"),
          (this.isTicking = !1);
        let { trackingPoints: i } = this,
          n = i[0],
          s = i[i.length - 1],
          a = 0,
          r = 0,
          l = 0;
        s &&
          n &&
          ((a = s.clientX - n.clientX),
          (r = s.clientY - n.clientY),
          (l = s.time - n.time));
        let c =
          ((t = window.visualViewport) === null || t === void 0
            ? void 0
            : t.scale) || 1;
        c !== 1 && ((a *= c), (r *= c));
        let d = 0,
          u = 0,
          m = 0,
          h = 0,
          b = this.option("decelFriction"),
          p = this.targetScale;
        if (l > 0) {
          (m = Math.abs(a) > 3 ? a / (l / 30) : 0),
            (h = Math.abs(r) > 3 ? r / (l / 30) : 0);
          let v = this.option("maxVelocity");
          v &&
            ((m = Math.max(Math.min(m, v), -1 * v)),
            (h = Math.max(Math.min(h, v), -1 * v)));
        }
        m && (d = m / (1 / (1 - b) - 1)),
          h && (u = h / (1 / (1 - b) - 1)),
          (this.option("lockAxis") === "y" ||
            (this.option("lockAxis") === "xy" &&
              this.lockedAxis === "y" &&
              Q(p) === this.minScale)) &&
            (d = m = 0),
          (this.option("lockAxis") === "x" ||
            (this.option("lockAxis") === "xy" &&
              this.lockedAxis === "x" &&
              Q(p) === this.minScale)) &&
            (u = h = 0);
        let f = this.dragOffset.x,
          g = this.dragOffset.y,
          F = this.option("dragMinThreshold") || 0;
        Math.abs(f) < F && Math.abs(g) < F && ((d = u = 0), (m = h = 0)),
          ((this.option("zoom") &&
            (p < this.minScale - 1e-5 || p > this.maxScale + 1e-5)) ||
            (e && !d && !u)) &&
            (b = 0.35),
          this.applyChange({ panX: d, panY: u, friction: b }),
          this.emit("decel", m, h, f, g);
      }
      onWheel(t) {
        var e = [-t.deltaX || 0, -t.deltaY || 0, -t.detail || 0].reduce(
          function (s, a) {
            return Math.abs(a) > Math.abs(s) ? a : s;
          },
        );
        let i = Math.max(-1, Math.min(1, e));
        if (
          (this.emit("wheel", t, i), this.panMode === Y || t.defaultPrevented)
        )
          return;
        let n = this.option("wheel");
        n === "pan"
          ? (t.preventDefault(),
            (this.panOnlyZoomed && !this.canZoomOut()) ||
              this.applyChange({
                panX: 2 * -t.deltaX,
                panY: 2 * -t.deltaY,
                bounce: !1,
              }))
          : n === "zoom" && this.option("zoom") !== !1 && this.zoomWithWheel(t);
      }
      onMouseMove(t) {
        this.panWithMouse(t);
      }
      onKeydown(t) {
        t.key === "Escape" && this.toggleFS();
      }
      onResize() {
        this.updateMetrics(), this.checkBounds().inBounds || this.requestTick();
      }
      setTransform() {
        this.emit("beforeTransform");
        let { current: t, target: e, content: i, contentRect: n } = this,
          s = Object.assign({}, Wt);
        for (let f of j) {
          let g = f == "e" || f === "f" ? Zt : Jn;
          (s[f] = Q(t[f], g)),
            Math.abs(e[f] - t[f]) < (f == "e" || f === "f" ? 0.51 : 0.001) &&
              (t[f] = e[f]);
        }
        let { a, b: r, c: l, d: c, e: d, f: u } = s,
          m = `matrix(${a}, ${r}, ${l}, ${c}, ${d}, ${u})`,
          h =
            i.parentElement instanceof HTMLPictureElement ? i.parentElement : i;
        if (
          (this.option("transformParent") && (h = h.parentElement || h),
          h.style.transform === m)
        )
          return;
        h.style.transform = m;
        let { contentWidth: b, contentHeight: p } = this.calculateContentDim();
        (n.width = b), (n.height = p), this.emit("afterTransform");
      }
      updateMetrics(t = !1) {
        var e;
        if (!this || this.state === U.Destroy || this.isContentLoading) return;
        let i = Math.max(
            1,
            ((e = window.visualViewport) === null || e === void 0
              ? void 0
              : e.scale) || 1,
          ),
          { container: n, content: s } = this,
          a = s instanceof HTMLImageElement,
          r = n.getBoundingClientRect(),
          l = getComputedStyle(this.container),
          c = r.width * i,
          d = r.height * i,
          u = parseFloat(l.paddingTop) + parseFloat(l.paddingBottom),
          m = c - (parseFloat(l.paddingLeft) + parseFloat(l.paddingRight)),
          h = d - u;
        this.containerRect = {
          width: c,
          height: d,
          innerWidth: m,
          innerHeight: h,
        };
        let b =
            parseFloat(s.dataset.width || "") ||
            ((W) => {
              let P = 0;
              return (
                (P =
                  W instanceof HTMLImageElement
                    ? W.naturalWidth
                    : W instanceof SVGElement
                      ? W.width.baseVal.value
                      : Math.max(W.offsetWidth, W.scrollWidth)),
                P || 0
              );
            })(s),
          p =
            parseFloat(s.dataset.height || "") ||
            ((W) => {
              let P = 0;
              return (
                (P =
                  W instanceof HTMLImageElement
                    ? W.naturalHeight
                    : W instanceof SVGElement
                      ? W.height.baseVal.value
                      : Math.max(W.offsetHeight, W.scrollHeight)),
                P || 0
              );
            })(s),
          f = this.option("width", b) || O,
          g = this.option("height", p) || O,
          F = f === O,
          v = g === O;
        typeof f != "number" && (f = b),
          typeof g != "number" && (g = p),
          F && (f = b * (g / p)),
          v && (g = p / (b / f));
        let B =
          s.parentElement instanceof HTMLPictureElement ? s.parentElement : s;
        this.option("transformParent") && (B = B.parentElement || B);
        let k = B.getAttribute("style") || "";
        B.style.setProperty("transform", "none", "important"),
          a && ((B.style.width = ""), (B.style.height = "")),
          B.offsetHeight;
        let X = s.getBoundingClientRect(),
          L = X.width * i,
          G = X.height * i,
          Pi = L,
          _i = G;
        (L = Math.min(L, f)),
          (G = Math.min(G, g)),
          a
            ? ({ width: L, height: G } = ((W, P, Ki, qi) => {
                let $i = Ki / W,
                  tn = qi / P,
                  He = Math.min($i, tn);
                return { width: (W *= He), height: (P *= He) };
              })(f, g, L, G))
            : ((L = Math.min(L, f)), (G = Math.min(G, g)));
        let je = 0.5 * (_i - G),
          Je = 0.5 * (Pi - L);
        (this.contentRect = Object.assign(Object.assign({}, this.contentRect), {
          top: X.top - r.top + je,
          bottom: r.bottom - X.bottom + je,
          left: X.left - r.left + Je,
          right: r.right - X.right + Je,
          fitWidth: L,
          fitHeight: G,
          width: L,
          height: G,
          fullWidth: f,
          fullHeight: g,
        })),
          (B.style.cssText = k),
          a && ((B.style.width = `${L}px`), (B.style.height = `${G}px`)),
          this.setTransform(),
          t !== !0 && this.emit("refresh"),
          this.ignoreBounds ||
            (Q(this.targetScale) < Q(this.minScale)
              ? this.zoomTo(this.minScale, { friction: 0 })
              : this.targetScale > this.maxScale
                ? this.zoomTo(this.maxScale, { friction: 0 })
                : this.state === U.Init ||
                  this.checkBounds().inBounds ||
                  this.requestTick()),
          this.updateControls();
      }
      calculateBounds() {
        let { contentWidth: t, contentHeight: e } = this.calculateContentDim(
            this.target,
          ),
          { targetScale: i, lockedAxis: n } = this,
          { fitWidth: s, fitHeight: a } = this.contentRect,
          r = 0,
          l = 0,
          c = 0,
          d = 0,
          u = this.option("infinite");
        if (u === !0 || (n && u === n))
          (r = -1 / 0), (c = 1 / 0), (l = -1 / 0), (d = 1 / 0);
        else {
          let { containerRect: m, contentRect: h } = this,
            b = Q(s * i, Zt),
            p = Q(a * i, Zt),
            { innerWidth: f, innerHeight: g } = m;
          if (
            (m.width === b && (f = m.width),
            m.width === p && (g = m.height),
            t > f)
          ) {
            (c = 0.5 * (t - f)), (r = -1 * c);
            let F = 0.5 * (h.right - h.left);
            (r += F), (c += F);
          }
          if (
            (s > f && t < f && ((r -= 0.5 * (s - f)), (c -= 0.5 * (s - f))),
            e > g)
          ) {
            (d = 0.5 * (e - g)), (l = -1 * d);
            let F = 0.5 * (h.bottom - h.top);
            (l += F), (d += F);
          }
          a > g && e < g && ((r -= 0.5 * (a - g)), (c -= 0.5 * (a - g)));
        }
        return { x: { min: r, max: c }, y: { min: l, max: d } };
      }
      getBounds() {
        let t = this.option("bounds");
        return t !== O ? t : this.calculateBounds();
      }
      updateControls() {
        let t = this,
          e = t.container,
          { panMode: i, contentRect: n, targetScale: s, minScale: a } = t,
          r = a,
          l = t.option("click") || !1;
        l && (r = t.getNextScale(l));
        let c = t.canZoomIn(),
          d = t.canZoomOut(),
          u = i === mi && !!this.option("touch"),
          m = d && u;
        if (
          (u &&
            (Q(s) < Q(a) && !this.panOnlyZoomed && (m = !0),
            (Q(n.width, 1) > Q(n.fitWidth, 1) ||
              Q(n.height, 1) > Q(n.fitHeight, 1)) &&
              (m = !0)),
          Q(n.width * s, 1) < Q(n.fitWidth, 1) && (m = !1),
          i === Y && (m = !1),
          z(e, this.cn("isDraggable"), m),
          !this.option("zoom"))
        )
          return;
        let h = c && Q(r) > Q(s),
          b = !h && !m && d && Q(r) < Q(s);
        z(e, this.cn("canZoomIn"), h), z(e, this.cn("canZoomOut"), b);
        for (let p of e.querySelectorAll("[data-panzoom-action]")) {
          let f = !1,
            g = !1;
          switch (p.dataset.panzoomAction) {
            case "zoomIn":
              c ? (f = !0) : (g = !0);
              break;
            case "zoomOut":
              d ? (f = !0) : (g = !0);
              break;
            case "toggleZoom":
            case "iterateZoom":
              c || d ? (f = !0) : (g = !0);
              let F = p.querySelector("g");
              F && (F.style.display = c ? "" : "none");
          }
          f
            ? (p.removeAttribute("disabled"), p.removeAttribute("tabindex"))
            : g &&
              (p.setAttribute("disabled", ""),
              p.setAttribute("tabindex", "-1"));
        }
      }
      panTo({
        x: t = this.target.e,
        y: e = this.target.f,
        scale: i = this.targetScale,
        friction: n = this.option("friction"),
        angle: s = 0,
        originX: a = 0,
        originY: r = 0,
        flipX: l = !1,
        flipY: c = !1,
        ignoreBounds: d = !1,
      }) {
        this.state !== U.Destroy &&
          this.applyChange({
            panX: t - this.target.e,
            panY: e - this.target.f,
            scale: i / this.targetScale,
            angle: s,
            originX: a,
            originY: r,
            friction: n,
            flipX: l,
            flipY: c,
            ignoreBounds: d,
          });
      }
      applyChange({
        panX: t = 0,
        panY: e = 0,
        scale: i = 1,
        angle: n = 0,
        originX: s = -this.current.e,
        originY: a = -this.current.f,
        friction: r = this.option("friction"),
        flipX: l = !1,
        flipY: c = !1,
        ignoreBounds: d = !1,
        bounce: u = this.option("bounce"),
      }) {
        let m = this.state;
        if (m === U.Destroy) return;
        this.rAF && (cancelAnimationFrame(this.rAF), (this.rAF = null)),
          (this.friction = r || 0),
          (this.ignoreBounds = d);
        let { current: h } = this,
          b = h.e,
          p = h.f,
          f = this.getMatrix(this.target),
          g = new DOMMatrix().translate(b, p).translate(s, a).translate(t, e);
        if (this.option("zoom")) {
          if (!d) {
            let F = this.targetScale,
              v = this.minScale,
              B = this.maxScale;
            F * i < v && (i = v / F), F * i > B && (i = B / F);
          }
          g = g.scale(i);
        }
        (g = g.translate(-s, -a).translate(-b, -p).multiply(f)),
          n && (g = g.rotate(n)),
          l && (g = g.scale(-1, 1)),
          c && (g = g.scale(1, -1));
        for (let F of j)
          F !== "e" &&
          F !== "f" &&
          (g[F] > this.minScale + 1e-5 || g[F] < this.minScale - 1e-5)
            ? (this.target[F] = g[F])
            : (this.target[F] = Q(g[F], Zt));
        (this.targetScale < this.scale ||
          Math.abs(i - 1) > 0.1 ||
          this.panMode === Y ||
          u === !1) &&
          !d &&
          this.clampTargetBounds(),
          m === U.Init
            ? this.animate()
            : this.isResting || ((this.state = U.Panning), this.requestTick());
      }
      stop(t = !1) {
        if (this.state === U.Init || this.state === U.Destroy) return;
        let e = this.isTicking;
        this.rAF && (cancelAnimationFrame(this.rAF), (this.rAF = null)),
          (this.isBouncingX = !1),
          (this.isBouncingY = !1);
        for (let i of j)
          (this.velocity[i] = 0),
            t === "current"
              ? (this.current[i] = this.target[i])
              : t === "target" && (this.target[i] = this.current[i]);
        this.setTransform(),
          x(this.container, "is-scaling"),
          x(this.container, "is-animating"),
          (this.isTicking = !1),
          (this.state = U.Ready),
          e && (this.emit("endAnimation"), this.updateControls());
      }
      requestTick() {
        this.isTicking ||
          (this.emit("startAnimation"),
          this.updateControls(),
          y(this.container, "is-animating"),
          this.isScaling && y(this.container, "is-scaling")),
          (this.isTicking = !0),
          this.rAF || (this.rAF = requestAnimationFrame(() => this.animate()));
      }
      panWithMouse(t, e = this.option("mouseMoveFriction")) {
        if (
          ((this.pmme = t),
          this.panMode !== Y || !t || Q(this.targetScale) <= Q(this.minScale))
        )
          return;
        this.emit("mouseMove", t);
        let { container: i, containerRect: n, contentRect: s } = this,
          a = n.width,
          r = n.height,
          l = i.getBoundingClientRect(),
          c = (t.clientX || 0) - l.left,
          d = (t.clientY || 0) - l.top,
          { contentWidth: u, contentHeight: m } = this.calculateContentDim(
            this.target,
          ),
          h = this.option("mouseMoveFactor");
        h > 1 && (u !== a && (u *= h), m !== r && (m *= h));
        let b = 0.5 * (u - a) - (((c / a) * 100) / 100) * (u - a);
        b += 0.5 * (s.right - s.left);
        let p = 0.5 * (m - r) - (((d / r) * 100) / 100) * (m - r);
        (p += 0.5 * (s.bottom - s.top)),
          this.applyChange({
            panX: b - this.target.e,
            panY: p - this.target.f,
            friction: e,
          });
      }
      zoomWithWheel(t) {
        if (this.state === U.Destroy || this.state === U.Init) return;
        let e = Date.now();
        if (e - this.pwt < 45) return void t.preventDefault();
        this.pwt = e;
        var i = [-t.deltaX || 0, -t.deltaY || 0, -t.detail || 0].reduce(
          function (c, d) {
            return Math.abs(d) > Math.abs(c) ? d : c;
          },
        );
        let n = Math.max(-1, Math.min(1, i)),
          { targetScale: s, maxScale: a, minScale: r } = this,
          l = (s * (100 + 45 * n)) / 100;
        Q(l) < Q(r) && Q(s) <= Q(r)
          ? ((this.cwd += Math.abs(n)), (l = r))
          : Q(l) > Q(a) && Q(s) >= Q(a)
            ? ((this.cwd += Math.abs(n)), (l = a))
            : ((this.cwd = 0), (l = Math.max(Math.min(l, a), r))),
          this.cwd > this.option("wheelLimit") ||
            (t.preventDefault(), Q(l) !== Q(s) && this.zoomTo(l, { event: t }));
      }
      canZoomIn() {
        return (
          this.option("zoom") &&
          (Q(this.contentRect.width, 1) < Q(this.contentRect.fitWidth, 1) ||
            Q(this.targetScale) < Q(this.maxScale))
        );
      }
      canZoomOut() {
        return this.option("zoom") && Q(this.targetScale) > Q(this.minScale);
      }
      zoomIn(t = 1.25, e) {
        this.zoomTo(this.targetScale * t, e);
      }
      zoomOut(t = 0.8, e) {
        this.zoomTo(this.targetScale * t, e);
      }
      zoomToFit(t) {
        this.zoomTo("fit", t);
      }
      zoomToCover(t) {
        this.zoomTo("cover", t);
      }
      zoomToFull(t) {
        this.zoomTo("full", t);
      }
      zoomToMax(t) {
        this.zoomTo("max", t);
      }
      toggleZoom(t) {
        this.zoomTo(this.getNextScale("toggleZoom"), t);
      }
      toggleMax(t) {
        this.zoomTo(this.getNextScale("toggleMax"), t);
      }
      toggleCover(t) {
        this.zoomTo(this.getNextScale("toggleCover"), t);
      }
      iterateZoom(t) {
        this.zoomTo("next", t);
      }
      zoomTo(
        t = 1,
        { friction: e = O, originX: i = O, originY: n = O, event: s } = {},
      ) {
        if (this.isContentLoading || this.state === U.Destroy) return;
        let { targetScale: a, fullScale: r, maxScale: l, coverScale: c } = this;
        if (
          (this.stop(),
          this.panMode === Y && (s = this.pmme || s),
          s || i === O || n === O)
        ) {
          let u = this.content.getBoundingClientRect(),
            m = this.container.getBoundingClientRect(),
            h = s ? s.clientX : m.left + 0.5 * m.width,
            b = s ? s.clientY : m.top + 0.5 * m.height;
          (i = h - u.left - 0.5 * u.width), (n = b - u.top - 0.5 * u.height);
        }
        let d = 1;
        typeof t == "number"
          ? (d = t)
          : t === "full"
            ? (d = r)
            : t === "cover"
              ? (d = c)
              : t === "max"
                ? (d = l)
                : t === "fit"
                  ? (d = 1)
                  : t === "next" && (d = this.getNextScale("iterateZoom")),
          (d = d / a || 1),
          (e = e === O ? (d > 1 ? 0.15 : 0.25) : e),
          this.applyChange({ scale: d, originX: i, originY: n, friction: e }),
          s && this.panMode === Y && this.panWithMouse(s, e);
      }
      rotateCCW() {
        this.applyChange({ angle: -90 });
      }
      rotateCW() {
        this.applyChange({ angle: 90 });
      }
      flipX() {
        this.applyChange({ flipX: !0 });
      }
      flipY() {
        this.applyChange({ flipY: !0 });
      }
      fitX() {
        this.stop("target");
        let { containerRect: t, contentRect: e, target: i } = this;
        this.applyChange({
          panX: 0.5 * t.width - (e.left + 0.5 * e.fitWidth) - i.e,
          panY: 0.5 * t.height - (e.top + 0.5 * e.fitHeight) - i.f,
          scale: t.width / e.fitWidth / this.targetScale,
          originX: 0,
          originY: 0,
          ignoreBounds: !0,
        });
      }
      fitY() {
        this.stop("target");
        let { containerRect: t, contentRect: e, target: i } = this;
        this.applyChange({
          panX: 0.5 * t.width - (e.left + 0.5 * e.fitWidth) - i.e,
          panY: 0.5 * t.innerHeight - (e.top + 0.5 * e.fitHeight) - i.f,
          scale: t.height / e.fitHeight / this.targetScale,
          originX: 0,
          originY: 0,
          ignoreBounds: !0,
        });
      }
      toggleFS() {
        let { container: t } = this,
          e = this.cn("inFullscreen"),
          i = this.cn("htmlHasFullscreen");
        t.classList.toggle(e);
        let n = t.classList.contains(e);
        n
          ? (document.documentElement.classList.add(i),
            document.addEventListener("keydown", this.onKeydown, !0))
          : (document.documentElement.classList.remove(i),
            document.removeEventListener("keydown", this.onKeydown, !0)),
          this.updateMetrics(),
          this.emit(n ? "enterFS" : "exitFS");
      }
      getMatrix(t = this.current) {
        let { a: e, b: i, c: n, d: s, e: a, f: r } = t;
        return new DOMMatrix([e, i, n, s, a, r]);
      }
      reset(t) {
        if (this.state !== U.Init && this.state !== U.Destroy) {
          this.stop("current");
          for (let e of j) this.target[e] = Wt[e];
          (this.target.a = this.minScale),
            (this.target.d = this.minScale),
            this.clampTargetBounds(),
            this.isResting ||
              ((this.friction = t === void 0 ? this.option("friction") : t),
              (this.state = U.Panning),
              this.requestTick());
        }
      }
      destroy() {
        this.stop(),
          (this.state = U.Destroy),
          this.detachEvents(),
          this.detachObserver();
        let { container: t, content: e } = this,
          i = this.option("classes") || {};
        for (let n of Object.values(i)) t.classList.remove(n + "");
        e &&
          (e.removeEventListener("load", this.onLoad),
          e.removeEventListener("error", this.onError)),
          this.detachPlugins();
      }
    };
  Object.defineProperty(nt, "defaults", {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: jn,
  }),
    Object.defineProperty(nt, "Plugins", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: {},
    });
  var pi = function (o, t) {
      let e = !0;
      return (...i) => {
        e &&
          ((e = !1),
          o(...i),
          setTimeout(() => {
            e = !0;
          }, t));
      };
    },
    fi = (o, t) => {
      let e = [];
      return (
        o.childNodes.forEach((i) => {
          i.nodeType !== Node.ELEMENT_NODE || (t && !i.matches(t)) || e.push(i);
        }),
        e
      );
    },
    Hn = {
      viewport: null,
      track: null,
      enabled: !0,
      slides: [],
      axis: "x",
      transition: "fade",
      preload: 1,
      slidesPerPage: "auto",
      initialPage: 0,
      friction: 0.12,
      Panzoom: { decelFriction: 0.12 },
      center: !0,
      infinite: !0,
      fill: !0,
      dragFree: !1,
      adaptiveHeight: !1,
      direction: "ltr",
      classes: {
        container: "f-carousel",
        viewport: "f-carousel__viewport",
        track: "f-carousel__track",
        slide: "f-carousel__slide",
        isLTR: "is-ltr",
        isRTL: "is-rtl",
        isHorizontal: "is-horizontal",
        isVertical: "is-vertical",
        inTransition: "in-transition",
        isSelected: "is-selected",
      },
      l10n: {
        NEXT: "Next slide",
        PREV: "Previous slide",
        GOTO: "Go to slide #%d",
      },
    },
    w;
  (function (o) {
    (o[(o.Init = 0)] = "Init"),
      (o[(o.Ready = 1)] = "Ready"),
      (o[(o.Destroy = 2)] = "Destroy");
  })(w || (w = {}));
  var we = (o) => {
      if (typeof o == "string" || o instanceof HTMLElement) o = { html: o };
      else {
        let t = o.thumb;
        t !== void 0 &&
          (typeof t == "string" && (o.thumbSrc = t),
          t instanceof HTMLImageElement &&
            ((o.thumbEl = t), (o.thumbElSrc = t.src), (o.thumbSrc = t.src)),
          delete o.thumb);
      }
      return Object.assign(
        {
          html: "",
          el: null,
          isDom: !1,
          class: "",
          customClass: "",
          index: -1,
          dim: 0,
          gap: 0,
          pos: 0,
          transition: !1,
        },
        o,
      );
    },
    Pn = (o = {}) =>
      Object.assign({ index: -1, slides: [], dim: 0, pos: -1 }, o),
    D = class extends dt {
      constructor(t, e) {
        super(e),
          Object.defineProperty(this, "instance", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: t,
          });
      }
      attach() {}
      detach() {}
    },
    _n = {
      classes: {
        list: "f-carousel__dots",
        isDynamic: "is-dynamic",
        hasDots: "has-dots",
        dot: "f-carousel__dot",
        isBeforePrev: "is-before-prev",
        isPrev: "is-prev",
        isCurrent: "is-current",
        isNext: "is-next",
        isAfterNext: "is-after-next",
      },
      dotTpl:
        '<button type="button" data-carousel-page="%i" aria-label="{{GOTO}}"><span class="f-carousel__dot" aria-hidden="true"></span></button>',
      dynamicFrom: 11,
      maxCount: 1 / 0,
      minCount: 2,
    },
    Vt = class extends D {
      constructor() {
        super(...arguments),
          Object.defineProperty(this, "isDynamic", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: !1,
          }),
          Object.defineProperty(this, "list", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: null,
          });
      }
      onRefresh() {
        this.refresh();
      }
      build() {
        let t = this.list;
        if (!t) {
          (t = document.createElement("ul")),
            y(t, this.cn("list")),
            t.setAttribute("role", "tablist");
          let e = this.instance.container;
          e.appendChild(t), y(e, this.cn("hasDots")), (this.list = t);
        }
        return t;
      }
      refresh() {
        var t;
        let e = this.instance.pages.length,
          i = Math.min(2, this.option("minCount")),
          n = Math.max(2e3, this.option("maxCount")),
          s = this.option("dynamicFrom");
        if (e < i || e > n) return void this.cleanup();
        let a = typeof s == "number" && e > 5 && e >= s,
          r =
            !this.list ||
            this.isDynamic !== a ||
            this.list.children.length !== e;
        r && this.cleanup();
        let l = this.build();
        if ((z(l, this.cn("isDynamic"), !!a), r))
          for (let u = 0; u < e; u++) l.append(this.createItem(u));
        let c,
          d = 0;
        for (let u of [...l.children]) {
          let m = d === this.instance.page;
          m && (c = u),
            z(u, this.cn("isCurrent"), m),
            (t = u.children[0]) === null ||
              t === void 0 ||
              t.setAttribute("aria-selected", m ? "true" : "false");
          for (let h of ["isBeforePrev", "isPrev", "isNext", "isAfterNext"])
            x(u, this.cn(h));
          d++;
        }
        if (((c = c || l.firstChild), a && c)) {
          let u = c.previousElementSibling,
            m = u && u.previousElementSibling;
          y(u, this.cn("isPrev")), y(m, this.cn("isBeforePrev"));
          let h = c.nextElementSibling,
            b = h && h.nextElementSibling;
          y(h, this.cn("isNext")), y(b, this.cn("isAfterNext"));
        }
        this.isDynamic = a;
      }
      createItem(t = 0) {
        var e;
        let i = document.createElement("li");
        i.setAttribute("role", "presentation");
        let n = S(
          this.instance
            .localize(this.option("dotTpl"), [["%d", t + 1]])
            .replace(/\%i/g, t + ""),
        );
        return (
          i.appendChild(n),
          (e = i.children[0]) === null ||
            e === void 0 ||
            e.setAttribute("role", "tab"),
          i
        );
      }
      cleanup() {
        this.list && (this.list.remove(), (this.list = null)),
          (this.isDynamic = !1),
          x(this.instance.container, this.cn("hasDots"));
      }
      attach() {
        this.instance.on(["refresh", "change"], this.onRefresh);
      }
      detach() {
        this.instance.off(["refresh", "change"], this.onRefresh),
          this.cleanup();
      }
    };
  Object.defineProperty(Vt, "defaults", {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: _n,
  });
  var Ct = "disabled",
    Et = "next",
    gi = "prev",
    It = class extends D {
      constructor() {
        super(...arguments),
          Object.defineProperty(this, "container", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: null,
          }),
          Object.defineProperty(this, "prev", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: null,
          }),
          Object.defineProperty(this, "next", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: null,
          }),
          Object.defineProperty(this, "isDom", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: !1,
          });
      }
      onRefresh() {
        let t = this.instance,
          e = t.pages.length,
          i = t.page;
        if (e < 2) return void this.cleanup();
        this.build();
        let n = this.prev,
          s = this.next;
        n &&
          s &&
          (n.removeAttribute(Ct),
          s.removeAttribute(Ct),
          t.isInfinite ||
            (i <= 0 && n.setAttribute(Ct, ""),
            i >= e - 1 && s.setAttribute(Ct, "")));
      }
      addBtn(t) {
        var e;
        let i = this.instance,
          n = document.createElement("button");
        n.setAttribute("tabindex", "0"),
          n.setAttribute("title", i.localize(`{{${t.toUpperCase()}}}`)),
          y(
            n,
            this.cn("button") + " " + this.cn(t === Et ? "isNext" : "isPrev"),
          );
        let s = i.isRTL ? (t === Et ? gi : Et) : t;
        var a;
        return (
          (n.innerHTML = i.localize(this.option(`${s}Tpl`))),
          (n.dataset[
            `carousel${((a = t), a ? (a.match("^[a-z]") ? a.charAt(0).toUpperCase() + a.substring(1) : a) : "")}`
          ] = "true"),
          (e = this.container) === null || e === void 0 || e.appendChild(n),
          n
        );
      }
      build() {
        let t = this.instance.container,
          e = this.cn("container"),
          { container: i, prev: n, next: s } = this;
        i || ((i = t.querySelector("." + e)), (this.isDom = !!i)),
          i || ((i = document.createElement("div")), y(i, e), t.appendChild(i)),
          (this.container = i),
          s || (s = i.querySelector("[data-carousel-next]")),
          s || (s = this.addBtn(Et)),
          (this.next = s),
          n || (n = i.querySelector("[data-carousel-prev]")),
          n || (n = this.addBtn(gi)),
          (this.prev = n);
      }
      cleanup() {
        this.isDom ||
          (this.prev && this.prev.remove(),
          this.next && this.next.remove(),
          this.container && this.container.remove()),
          (this.prev = null),
          (this.next = null),
          (this.container = null),
          (this.isDom = !1);
      }
      attach() {
        this.instance.on(["refresh", "change"], this.onRefresh);
      }
      detach() {
        this.instance.off(["refresh", "change"], this.onRefresh),
          this.cleanup();
      }
    };
  Object.defineProperty(It, "defaults", {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: {
      classes: {
        container: "f-carousel__nav",
        button: "f-button",
        isNext: "is-next",
        isPrev: "is-prev",
      },
      nextTpl:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M9 3l9 9-9 9"/></svg>',
      prevTpl:
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M15 3l-9 9 9 9"/></svg>',
    },
  });
  var St = class extends D {
    constructor() {
      super(...arguments),
        Object.defineProperty(this, "selectedIndex", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: null,
        }),
        Object.defineProperty(this, "target", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: null,
        }),
        Object.defineProperty(this, "nav", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: null,
        });
    }
    addAsTargetFor(t) {
      (this.target = this.instance), (this.nav = t), this.attachEvents();
    }
    addAsNavFor(t) {
      (this.nav = this.instance), (this.target = t), this.attachEvents();
    }
    attachEvents() {
      let { nav: t, target: e } = this;
      t &&
        e &&
        ((t.options.initialSlide = e.options.initialPage),
        t.state === w.Ready
          ? this.onNavReady(t)
          : t.on("ready", this.onNavReady),
        e.state === w.Ready
          ? this.onTargetReady(e)
          : e.on("ready", this.onTargetReady));
    }
    onNavReady(t) {
      t.on("createSlide", this.onNavCreateSlide),
        t.on("Panzoom.click", this.onNavClick),
        t.on("Panzoom.touchEnd", this.onNavTouch),
        this.onTargetChange();
    }
    onTargetReady(t) {
      t.on("change", this.onTargetChange),
        t.on("Panzoom.refresh", this.onTargetChange),
        this.onTargetChange();
    }
    onNavClick(t, e, i) {
      this.onNavTouch(t, t.panzoom, i);
    }
    onNavTouch(t, e, i) {
      var n, s;
      if (Math.abs(e.dragOffset.x) > 3 || Math.abs(e.dragOffset.y) > 3) return;
      let a = i.target,
        { nav: r, target: l } = this;
      if (!r || !l || !a) return;
      let c = a.closest("[data-index]");
      if ((i.stopPropagation(), i.preventDefault(), !c)) return;
      let d = parseInt(c.dataset.index || "", 10) || 0,
        u = l.getPageForSlide(d),
        m = r.getPageForSlide(d);
      r.slideTo(m),
        l.slideTo(u, {
          friction:
            ((s =
              (n = this.nav) === null || n === void 0 ? void 0 : n.plugins) ===
              null || s === void 0
              ? void 0
              : s.Sync.option("friction")) || 0,
        }),
        this.markSelectedSlide(d);
    }
    onNavCreateSlide(t, e) {
      e.index === this.selectedIndex && this.markSelectedSlide(e.index);
    }
    onTargetChange() {
      var t, e;
      let { target: i, nav: n } = this;
      if (!i || !n || n.state !== w.Ready || i.state !== w.Ready) return;
      let s =
          (e =
            (t = i.pages[i.page]) === null || t === void 0
              ? void 0
              : t.slides[0]) === null || e === void 0
            ? void 0
            : e.index,
        a = n.getPageForSlide(s);
      this.markSelectedSlide(s),
        n.slideTo(
          a,
          n.prevPage === null && i.prevPage === null ? { friction: 0 } : void 0,
        );
    }
    markSelectedSlide(t) {
      let e = this.nav;
      e &&
        e.state === w.Ready &&
        ((this.selectedIndex = t),
        [...e.slides].map((i) => {
          i.el &&
            i.el.classList[i.index === t ? "add" : "remove"]("is-nav-selected");
        }));
    }
    attach() {
      let t = this,
        e = t.options.target,
        i = t.options.nav;
      e ? t.addAsNavFor(e) : i && t.addAsTargetFor(i);
    }
    detach() {
      let t = this,
        e = t.nav,
        i = t.target;
      e &&
        (e.off("ready", t.onNavReady),
        e.off("createSlide", t.onNavCreateSlide),
        e.off("Panzoom.click", t.onNavClick),
        e.off("Panzoom.touchEnd", t.onNavTouch)),
        (t.nav = null),
        i &&
          (i.off("ready", t.onTargetReady),
          i.off("refresh", t.onTargetChange),
          i.off("change", t.onTargetChange)),
        (t.target = null);
    }
  };
  Object.defineProperty(St, "defaults", {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: { friction: 0.35 },
  });
  var Kn = { Navigation: It, Dots: Vt, Sync: St },
    Mt = "animationend",
    Qi = "isSelected",
    Dt = "slide",
    ct = class o extends Qt {
      get axis() {
        return this.isHorizontal ? "e" : "f";
      }
      get isEnabled() {
        return this.state === w.Ready;
      }
      get isInfinite() {
        let t = !1,
          { contentDim: e, viewportDim: i, pages: n, slides: s } = this,
          a = s[0];
        return (
          n.length >= 2 && a && e + a.dim >= i && (t = this.option("infinite")),
          t
        );
      }
      get isRTL() {
        return this.option("direction") === "rtl";
      }
      get isHorizontal() {
        return this.option("axis") === "x";
      }
      constructor(t, e = {}, i = {}) {
        if (
          (super(),
          Object.defineProperty(this, "bp", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: "",
          }),
          Object.defineProperty(this, "lp", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: 0,
          }),
          Object.defineProperty(this, "userOptions", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: {},
          }),
          Object.defineProperty(this, "userPlugins", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: {},
          }),
          Object.defineProperty(this, "state", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: w.Init,
          }),
          Object.defineProperty(this, "page", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: 0,
          }),
          Object.defineProperty(this, "prevPage", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: null,
          }),
          Object.defineProperty(this, "container", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: void 0,
          }),
          Object.defineProperty(this, "viewport", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: null,
          }),
          Object.defineProperty(this, "track", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: null,
          }),
          Object.defineProperty(this, "slides", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: [],
          }),
          Object.defineProperty(this, "pages", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: [],
          }),
          Object.defineProperty(this, "panzoom", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: null,
          }),
          Object.defineProperty(this, "inTransition", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: new Set(),
          }),
          Object.defineProperty(this, "contentDim", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: 0,
          }),
          Object.defineProperty(this, "viewportDim", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: 0,
          }),
          typeof t == "string" && (t = document.querySelector(t)),
          !t || !C(t))
        )
          throw new Error("No Element found");
        (this.container = t),
          (this.slideNext = pi(this.slideNext.bind(this), 150)),
          (this.slidePrev = pi(this.slidePrev.bind(this), 150)),
          (this.userOptions = e),
          (this.userPlugins = i),
          queueMicrotask(() => {
            this.processOptions();
          });
      }
      processOptions() {
        var t, e;
        let i = E({}, o.defaults, this.userOptions),
          n = "",
          s = i.breakpoints;
        if (s && Ve(s))
          for (let [a, r] of Object.entries(s))
            window.matchMedia(a).matches && Ve(r) && ((n += a), E(i, r));
        (n === this.bp && this.state !== w.Init) ||
          ((this.bp = n),
          this.state === w.Ready &&
            (i.initialSlide =
              ((e =
                (t = this.pages[this.page]) === null || t === void 0
                  ? void 0
                  : t.slides[0]) === null || e === void 0
                ? void 0
                : e.index) || 0),
          this.state !== w.Init && this.destroy(),
          super.setOptions(i),
          this.option("enabled") === !1
            ? this.attachEvents()
            : setTimeout(() => {
                this.init();
              }, 0));
      }
      init() {
        (this.state = w.Init),
          this.emit("init"),
          this.attachPlugins(
            Object.assign(Object.assign({}, o.Plugins), this.userPlugins),
          ),
          this.emit("attachPlugins"),
          this.initLayout(),
          this.initSlides(),
          this.updateMetrics(),
          this.setInitialPosition(),
          this.initPanzoom(),
          this.attachEvents(),
          (this.state = w.Ready),
          this.emit("ready");
      }
      initLayout() {
        let { container: t } = this,
          e = this.option("classes");
        y(t, this.cn("container")),
          z(t, e.isLTR, !this.isRTL),
          z(t, e.isRTL, this.isRTL),
          z(t, e.isVertical, !this.isHorizontal),
          z(t, e.isHorizontal, this.isHorizontal);
        let i = this.option("viewport") || t.querySelector(`.${e.viewport}`);
        i ||
          ((i = document.createElement("div")),
          y(i, e.viewport),
          i.append(...fi(t, `.${e.slide}`)),
          t.prepend(i)),
          i.addEventListener("scroll", this.onScroll);
        let n = this.option("track") || t.querySelector(`.${e.track}`);
        n ||
          ((n = document.createElement("div")),
          y(n, e.track),
          n.append(...Array.from(i.childNodes))),
          n.setAttribute("aria-live", "polite"),
          i.contains(n) || i.prepend(n),
          (this.viewport = i),
          (this.track = n),
          this.emit("initLayout");
      }
      initSlides() {
        let { track: t } = this;
        if (!t) return;
        let e = [...this.slides],
          i = [];
        [...fi(t, `.${this.cn(Dt)}`)].forEach((n) => {
          if (C(n)) {
            let s = we({ el: n, isDom: !0, index: this.slides.length });
            i.push(s);
          }
        });
        for (let n of [...(this.option("slides", []) || []), ...e])
          i.push(we(n));
        this.slides = i;
        for (let n = 0; n < this.slides.length; n++) this.slides[n].index = n;
        for (let n of i)
          this.emit("beforeInitSlide", n, n.index),
            this.emit("initSlide", n, n.index);
        this.emit("initSlides");
      }
      setInitialPage() {
        let t = this.option("initialSlide");
        this.page =
          typeof t == "number"
            ? this.getPageForSlide(t)
            : parseInt(this.option("initialPage", 0) + "", 10) || 0;
      }
      setInitialPosition() {
        let { track: t, pages: e, isHorizontal: i } = this;
        if (!t || !e.length) return;
        let n = this.page;
        e[n] || (this.page = n = 0);
        let s = (e[n].pos || 0) * (this.isRTL && i ? 1 : -1),
          a = i ? `${s}px` : "0",
          r = i ? "0" : `${s}px`;
        (t.style.transform = `translate3d(${a}, ${r}, 0) scale(1)`),
          this.option("adaptiveHeight") && this.setViewportHeight();
      }
      initPanzoom() {
        this.panzoom && (this.panzoom.destroy(), (this.panzoom = null));
        let t = this.option("Panzoom") || {};
        (this.panzoom = new nt(
          this.viewport,
          E(
            {},
            {
              content: this.track,
              zoom: !1,
              panOnlyZoomed: !1,
              lockAxis: this.isHorizontal ? "x" : "y",
              infinite: this.isInfinite,
              click: !1,
              dblClick: !1,
              touch: (e) => !(this.pages.length < 2 && !e.options.infinite),
              bounds: () => this.getBounds(),
              maxVelocity: (e) =>
                Math.abs(e.target[this.axis] - e.current[this.axis]) <
                2 * this.viewportDim
                  ? 100
                  : 0,
            },
            t,
          ),
        )),
          this.panzoom.on("*", (e, i, ...n) => {
            this.emit(`Panzoom.${i}`, e, ...n);
          }),
          this.panzoom.on("decel", this.onDecel),
          this.panzoom.on("refresh", this.onRefresh),
          this.panzoom.on("beforeTransform", this.onBeforeTransform),
          this.panzoom.on("endAnimation", this.onEndAnimation);
      }
      attachEvents() {
        let t = this.container;
        t &&
          (t.addEventListener("click", this.onClick, {
            passive: !1,
            capture: !1,
          }),
          t.addEventListener("slideTo", this.onSlideTo)),
          window.addEventListener("resize", this.onResize);
      }
      createPages() {
        let t = [],
          { contentDim: e, viewportDim: i } = this,
          n = this.option("slidesPerPage");
        n =
          (n === "auto" || e <= i) && this.option("fill") !== !1
            ? 1 / 0
            : parseFloat(n + "");
        let s = 0,
          a = 0,
          r = 0;
        for (let l of this.slides)
          (!t.length || a + l.dim - i > 0.05 || r >= n) &&
            (t.push(Pn()), (s = t.length - 1), (a = 0), (r = 0)),
            t[s].slides.push(l),
            (a += l.dim + l.gap),
            r++;
        return t;
      }
      processPages() {
        let t = this.pages,
          { contentDim: e, viewportDim: i, isInfinite: n } = this,
          s = this.option("center"),
          a = this.option("fill"),
          r = a && s && e > i && !n;
        if (
          (t.forEach((d, u) => {
            var m;
            (d.index = u),
              (d.pos =
                ((m = d.slides[0]) === null || m === void 0 ? void 0 : m.pos) ||
                0),
              (d.dim = 0);
            for (let [h, b] of d.slides.entries())
              (d.dim += b.dim), h < d.slides.length - 1 && (d.dim += b.gap);
            r && d.pos + 0.5 * d.dim < 0.5 * i
              ? (d.pos = 0)
              : r && d.pos + 0.5 * d.dim >= e - 0.5 * i
                ? (d.pos = e - i)
                : s && (d.pos += -0.5 * (i - d.dim));
          }),
          t.forEach((d) => {
            a &&
              !n &&
              e > i &&
              ((d.pos = Math.max(d.pos, 0)), (d.pos = Math.min(d.pos, e - i))),
              (d.pos = Q(d.pos, 1e3)),
              (d.dim = Q(d.dim, 1e3)),
              Math.abs(d.pos) <= 0.1 && (d.pos = 0);
          }),
          n)
        )
          return t;
        let l = [],
          c;
        return (
          t.forEach((d) => {
            let u = Object.assign({}, d);
            c && u.pos === c.pos
              ? ((c.dim += u.dim), (c.slides = [...c.slides, ...u.slides]))
              : ((u.index = l.length), (c = u), l.push(u));
          }),
          l
        );
      }
      getPageFromIndex(t = 0) {
        let e = this.pages.length,
          i;
        return (
          (t = parseInt((t || 0).toString()) || 0),
          (i = this.isInfinite
            ? ((t % e) + e) % e
            : Math.max(Math.min(t, e - 1), 0)),
          i
        );
      }
      getSlideMetrics(t) {
        var e, i;
        let n = this.isHorizontal ? "width" : "height",
          s = 0,
          a = 0,
          r = t.el,
          l = !(!r || r.parentNode);
        if (
          (r
            ? (s = parseFloat(r.dataset[n] || "") || 0)
            : ((r = document.createElement("div")),
              (r.style.visibility = "hidden"),
              (this.track || document.body).prepend(r)),
          y(r, this.cn(Dt) + " " + t.class + " " + t.customClass),
          s)
        )
          (r.style[n] = `${s}px`),
            (r.style[n === "width" ? "height" : "width"] = "");
        else {
          l && (this.track || document.body).prepend(r),
            (s =
              r.getBoundingClientRect()[n] *
              Math.max(
                1,
                ((e = window.visualViewport) === null || e === void 0
                  ? void 0
                  : e.scale) || 1,
              ));
          let d = r[this.isHorizontal ? "offsetWidth" : "offsetHeight"];
          d - 1 > s && (s = d);
        }
        let c = getComputedStyle(r);
        return (
          c.boxSizing === "content-box" &&
            (this.isHorizontal
              ? ((s += parseFloat(c.paddingLeft) || 0),
                (s += parseFloat(c.paddingRight) || 0))
              : ((s += parseFloat(c.paddingTop) || 0),
                (s += parseFloat(c.paddingBottom) || 0))),
          (a =
            parseFloat(c[this.isHorizontal ? "marginRight" : "marginBottom"]) ||
            0),
          l
            ? (i = r.parentElement) === null || i === void 0 || i.removeChild(r)
            : t.el || r.remove(),
          { dim: Q(s, 1e3), gap: Q(a, 1e3) }
        );
      }
      getBounds() {
        let { isInfinite: t, isRTL: e, isHorizontal: i, pages: n } = this,
          s = { min: 0, max: 0 };
        if (t) s = { min: -1 / 0, max: 1 / 0 };
        else if (n.length) {
          let a = n[0].pos,
            r = n[n.length - 1].pos;
          s = e && i ? { min: a, max: r } : { min: -1 * r, max: -1 * a };
        }
        return { x: i ? s : { min: 0, max: 0 }, y: i ? { min: 0, max: 0 } : s };
      }
      repositionSlides() {
        let t,
          {
            isHorizontal: e,
            isRTL: i,
            isInfinite: n,
            viewport: s,
            viewportDim: a,
            contentDim: r,
            page: l,
            pages: c,
            slides: d,
            panzoom: u,
          } = this,
          m = 0,
          h = 0,
          b = 0,
          p = 0;
        u ? (p = -1 * u.current[this.axis]) : c[l] && (p = c[l].pos || 0),
          (t = e ? (i ? "right" : "left") : "top"),
          i && e && (p *= -1);
        for (let v of d) {
          let B = v.el;
          B
            ? (t === "top"
                ? ((B.style.right = ""), (B.style.left = ""))
                : (B.style.top = ""),
              v.index !== m
                ? (B.style[t] = h === 0 ? "" : `${Q(h, 1e3)}px`)
                : (B.style[t] = ""),
              (b += v.dim + v.gap),
              m++)
            : (h += v.dim + v.gap);
        }
        if (n && b && s) {
          let v = getComputedStyle(s),
            B = "padding",
            k = e ? "Right" : "Bottom",
            X = parseFloat(v[B + (e ? "Left" : "Top")]);
          (p -= X), (a += X), (a += parseFloat(v[B + k]));
          for (let L of d)
            L.el &&
              (Q(L.pos) < Q(a) &&
                Q(L.pos + L.dim + L.gap) < Q(p) &&
                Q(p) > Q(r - a) &&
                (L.el.style[t] = `${Q(h + b, 1e3)}px`),
              Q(L.pos + L.gap) >= Q(r - a) &&
                Q(L.pos) > Q(p + a) &&
                Q(p) < Q(a) &&
                (L.el.style[t] = `-${Q(b, 1e3)}px`));
        }
        let f,
          g,
          F = [...this.inTransition];
        if ((F.length > 1 && ((f = c[F[0]]), (g = c[F[1]])), f && g)) {
          let v = 0;
          for (let B of d)
            B.el
              ? this.inTransition.has(B.index) &&
                f.slides.indexOf(B) < 0 &&
                (B.el.style[t] = `${Q(v + (f.pos - g.pos), 1e3)}px`)
              : (v += B.dim + B.gap);
        }
      }
      createSlideEl(t) {
        let { track: e, slides: i } = this;
        if (!e || !t || (t.el && t.el.parentNode)) return;
        let n = t.el || document.createElement("div");
        y(n, this.cn(Dt)), y(n, t.class), y(n, t.customClass);
        let s = t.html;
        s &&
          (s instanceof HTMLElement
            ? n.appendChild(s)
            : (n.innerHTML = t.html + ""));
        let a = [];
        i.forEach((d, u) => {
          d.el && a.push(u);
        });
        let r = t.index,
          l = null;
        a.length &&
          (l =
            i[a.reduce((d, u) => (Math.abs(u - r) < Math.abs(d - r) ? u : d))]);
        let c =
          l && l.el && l.el.parentNode
            ? l.index < t.index
              ? l.el.nextSibling
              : l.el
            : null;
        e.insertBefore(n, e.contains(c) ? c : null),
          (t.el = n),
          this.emit("createSlide", t);
      }
      removeSlideEl(t, e = !1) {
        let i = t?.el;
        if (!i || !i.parentNode) return;
        let n = this.cn(Qi);
        if (
          (i.classList.contains(n) && (x(i, n), this.emit("unselectSlide", t)),
          t.isDom && !e)
        )
          return (
            i.removeAttribute("aria-hidden"),
            i.removeAttribute("data-index"),
            void (i.style.left = "")
          );
        this.emit("removeSlide", t);
        let s = new CustomEvent(Mt);
        i.dispatchEvent(s), t.el && (t.el.remove(), (t.el = null));
      }
      transitionTo(t = 0, e = this.option("transition")) {
        var i, n, s, a;
        if (!e) return !1;
        let r = this.page,
          { pages: l, panzoom: c } = this;
        t = parseInt((t || 0).toString()) || 0;
        let d = this.getPageFromIndex(t);
        if (
          !c ||
          !l[d] ||
          l.length < 2 ||
          Math.abs(
            (((n =
              (i = l[r]) === null || i === void 0 ? void 0 : i.slides[0]) ===
              null || n === void 0
              ? void 0
              : n.dim) || 0) - this.viewportDim,
          ) > 1
        )
          return !1;
        let u = t > r ? 1 : -1;
        this.isInfinite &&
          (r === 0 && t === l.length - 1 && (u = -1),
          r === l.length - 1 && t === 0 && (u = 1));
        let m = l[d].pos * (this.isRTL ? 1 : -1);
        if (r === d && Math.abs(m - c.target[this.axis]) < 1) return !1;
        this.clearTransitions();
        let h = c.isResting;
        y(this.container, this.cn("inTransition"));
        let b =
            ((s = l[r]) === null || s === void 0 ? void 0 : s.slides[0]) ||
            null,
          p =
            ((a = l[d]) === null || a === void 0 ? void 0 : a.slides[0]) ||
            null;
        this.inTransition.add(p.index), this.createSlideEl(p);
        let f = b.el,
          g = p.el;
        h || e === Dt || ((e = "fadeFast"), (f = null));
        let F = this.isRTL ? "next" : "prev",
          v = this.isRTL ? "prev" : "next";
        return (
          f &&
            (this.inTransition.add(b.index),
            (b.transition = e),
            f.addEventListener(Mt, this.onAnimationEnd),
            f.classList.add(`f-${e}Out`, `to-${u > 0 ? v : F}`)),
          g &&
            ((p.transition = e),
            g.addEventListener(Mt, this.onAnimationEnd),
            g.classList.add(`f-${e}In`, `from-${u > 0 ? F : v}`)),
          (c.current[this.axis] = m),
          (c.target[this.axis] = m),
          c.requestTick(),
          this.onChange(d),
          !0
        );
      }
      manageSlideVisiblity() {
        let t = new Set(),
          e = new Set(),
          i = this.getVisibleSlides(
            parseFloat(this.option("preload", 0) + "") || 0,
          );
        for (let n of this.slides) i.has(n) ? t.add(n) : e.add(n);
        for (let n of this.inTransition) t.add(this.slides[n]);
        for (let n of t) this.createSlideEl(n), this.lazyLoadSlide(n);
        for (let n of e) t.has(n) || this.removeSlideEl(n);
        this.markSelectedSlides(), this.repositionSlides();
      }
      markSelectedSlides() {
        if (!this.pages[this.page] || !this.pages[this.page].slides) return;
        let t = "aria-hidden",
          e = this.cn(Qi);
        if (e)
          for (let i of this.slides) {
            let n = i.el;
            n &&
              ((n.dataset.index = `${i.index}`),
              n.classList.contains("f-thumbs__slide")
                ? this.getVisibleSlides(0).has(i)
                  ? n.removeAttribute(t)
                  : n.setAttribute(t, "true")
                : this.pages[this.page].slides.includes(i)
                  ? (n.classList.contains(e) ||
                      (y(n, e), this.emit("selectSlide", i)),
                    n.removeAttribute(t))
                  : (n.classList.contains(e) &&
                      (x(n, e), this.emit("unselectSlide", i)),
                    n.setAttribute(t, "true")));
          }
      }
      flipInfiniteTrack() {
        let {
            axis: t,
            isHorizontal: e,
            isInfinite: i,
            isRTL: n,
            viewportDim: s,
            contentDim: a,
          } = this,
          r = this.panzoom;
        if (!r || !i) return;
        let l = r.current[t],
          c = r.target[t] - l,
          d = 0,
          u = 0.5 * s;
        n && e
          ? (l < -u && ((d = -1), (l += a)), l > a - u && ((d = 1), (l -= a)))
          : (l > u && ((d = 1), (l -= a)), l < -a + u && ((d = -1), (l += a))),
          d && ((r.current[t] = l), (r.target[t] = l + c));
      }
      lazyLoadImg(t, e) {
        let i = this,
          n = "f-fadeIn",
          s = "is-preloading",
          a = !1,
          r = null,
          l = () => {
            a ||
              ((a = !0),
              r && (r.remove(), (r = null)),
              x(e, s),
              e.complete &&
                (y(e, n),
                setTimeout(() => {
                  x(e, n);
                }, 350)),
              this.option("adaptiveHeight") &&
                t.el &&
                this.pages[this.page].slides.indexOf(t) > -1 &&
                (i.updateMetrics(), i.setViewportHeight()),
              this.emit("load", t));
          };
        y(e, s),
          (e.src = e.dataset.lazySrcset || e.dataset.lazySrc || ""),
          delete e.dataset.lazySrc,
          delete e.dataset.lazySrcset,
          e.addEventListener("error", () => {
            l();
          }),
          e.addEventListener("load", () => {
            l();
          }),
          setTimeout(() => {
            let c = e.parentNode;
            c &&
              t.el &&
              (e.complete ? l() : a || ((r = S(ze)), c.insertBefore(r, e)));
          }, 300);
      }
      lazyLoadSlide(t) {
        let e = t && t.el;
        if (!e) return;
        let i = new Set(),
          n = Array.from(
            e.querySelectorAll("[data-lazy-src],[data-lazy-srcset]"),
          );
        e.dataset.lazySrc && n.push(e),
          n.map((s) => {
            s instanceof HTMLImageElement
              ? i.add(s)
              : s instanceof HTMLElement &&
                s.dataset.lazySrc &&
                ((s.style.backgroundImage = `url('${s.dataset.lazySrc}')`),
                delete s.dataset.lazySrc);
          });
        for (let s of i) this.lazyLoadImg(t, s);
      }
      onAnimationEnd(t) {
        var e;
        let i = t.target,
          n = i ? parseInt(i.dataset.index || "", 10) || 0 : -1,
          s = this.slides[n],
          a = t.animationName;
        if (!i || !s || !a) return;
        let r = !!this.inTransition.has(n) && s.transition;
        r &&
          a.substring(0, r.length + 2) === `f-${r}` &&
          this.inTransition.delete(n),
          this.inTransition.size || this.clearTransitions(),
          n === this.page &&
            !((e = this.panzoom) === null || e === void 0) &&
            e.isResting &&
            this.emit("settle");
      }
      onDecel(t, e = 0, i = 0, n = 0, s = 0) {
        if (this.option("dragFree")) return void this.setPageFromPosition();
        let { isRTL: a, isHorizontal: r, axis: l, pages: c } = this,
          d = c.length,
          u = Math.abs(Math.atan2(i, e) / (Math.PI / 180)),
          m = 0;
        if (((m = u > 45 && u < 135 ? (r ? 0 : i) : r ? e : 0), !d)) return;
        let h = this.page,
          b = a && r ? 1 : -1,
          p = t.current[l] * b,
          { pageIndex: f } = this.getPageFromPosition(p);
        Math.abs(m) > 5
          ? (c[h].dim <
              document.documentElement[
                "client" + (this.isHorizontal ? "Width" : "Height")
              ] -
                1 && (h = f),
            (h = a && r ? (m < 0 ? h - 1 : h + 1) : m < 0 ? h + 1 : h - 1))
          : (h = n === 0 && s === 0 ? h : f),
          this.slideTo(h, {
            transition: !1,
            friction: t.option("decelFriction"),
          });
      }
      onClick(t) {
        let e = t.target,
          i = e && C(e) ? e.dataset : null,
          n,
          s;
        i &&
          (i.carouselPage !== void 0
            ? ((s = "slideTo"), (n = i.carouselPage))
            : i.carouselNext !== void 0
              ? (s = "slideNext")
              : i.carouselPrev !== void 0 && (s = "slidePrev")),
          s
            ? (t.preventDefault(),
              t.stopPropagation(),
              e && !e.hasAttribute("disabled") && this[s](n))
            : this.emit("click", t);
      }
      onSlideTo(t) {
        let e = t.detail || 0;
        this.slideTo(this.getPageForSlide(e), { friction: 0 });
      }
      onChange(t, e = 0) {
        let i = this.page;
        (this.prevPage = i),
          (this.page = t),
          this.option("adaptiveHeight") && this.setViewportHeight(),
          t !== i && (this.markSelectedSlides(), this.emit("change", t, i, e));
      }
      onRefresh() {
        let t = this.contentDim,
          e = this.viewportDim;
        this.updateMetrics(),
          (this.contentDim === t && this.viewportDim === e) ||
            this.slideTo(this.page, { friction: 0, transition: !1 });
      }
      onScroll() {
        var t;
        (t = this.viewport) === null || t === void 0 || t.scroll(0, 0);
      }
      onResize() {
        this.option("breakpoints") && this.processOptions();
      }
      onBeforeTransform(t) {
        this.lp !== t.current[this.axis] &&
          (this.flipInfiniteTrack(), this.manageSlideVisiblity()),
          (this.lp = t.current.e);
      }
      onEndAnimation() {
        this.inTransition.size || this.emit("settle");
      }
      reInit(t = null, e = null) {
        this.destroy(),
          (this.state = w.Init),
          (this.prevPage = null),
          (this.userOptions = t || this.userOptions),
          (this.userPlugins = e || this.userPlugins),
          this.processOptions();
      }
      slideTo(
        t = 0,
        {
          friction: e = this.option("friction"),
          transition: i = this.option("transition"),
        } = {},
      ) {
        if (this.state === w.Destroy) return;
        t = parseInt((t || 0).toString()) || 0;
        let n = this.getPageFromIndex(t),
          { axis: s, isHorizontal: a, isRTL: r, pages: l, panzoom: c } = this,
          d = l.length,
          u = r && a ? 1 : -1;
        if (!c || !d) return;
        if (this.page !== n) {
          let h = new Event("beforeChange", { bubbles: !0, cancelable: !0 });
          if ((this.emit("beforeChange", h, t), h.defaultPrevented)) return;
        }
        if (this.transitionTo(t, i)) return;
        let m = l[n].pos;
        if (this.isInfinite) {
          let h = this.contentDim,
            b = c.target[s] * u;
          d === 2
            ? (m += h * Math.floor(parseFloat(t + "") / 2))
            : (m = [m, m - h, m + h].reduce(function (p, f) {
                return Math.abs(f - b) < Math.abs(p - b) ? f : p;
              }));
        }
        (m *= u),
          Math.abs(c.target[s] - m) < 1 ||
            (c.panTo({ x: a ? m : 0, y: a ? 0 : m, friction: e }),
            this.onChange(n));
      }
      slideToClosest(t) {
        if (this.panzoom) {
          let { pageIndex: e } = this.getPageFromPosition();
          this.slideTo(e, t);
        }
      }
      slideNext() {
        this.slideTo(this.page + 1);
      }
      slidePrev() {
        this.slideTo(this.page - 1);
      }
      clearTransitions() {
        this.inTransition.clear(), x(this.container, this.cn("inTransition"));
        let t = ["to-prev", "to-next", "from-prev", "from-next"];
        for (let e of this.slides) {
          let i = e.el;
          if (i) {
            i.removeEventListener(Mt, this.onAnimationEnd),
              i.classList.remove(...t);
            let n = e.transition;
            n && i.classList.remove(`f-${n}Out`, `f-${n}In`);
          }
        }
        this.manageSlideVisiblity();
      }
      addSlide(t, e) {
        var i, n, s, a;
        let r = this.panzoom,
          l =
            ((i = this.pages[this.page]) === null || i === void 0
              ? void 0
              : i.pos) || 0,
          c =
            ((n = this.pages[this.page]) === null || n === void 0
              ? void 0
              : n.dim) || 0,
          d = this.contentDim < this.viewportDim,
          u = Array.isArray(e) ? e : [e],
          m = [];
        for (let h of u) m.push(we(h));
        this.slides.splice(t, 0, ...m);
        for (let h = 0; h < this.slides.length; h++) this.slides[h].index = h;
        for (let h of m) this.emit("beforeInitSlide", h, h.index);
        if (
          (this.page >= t && (this.page += m.length), this.updateMetrics(), r)
        ) {
          let h =
              ((s = this.pages[this.page]) === null || s === void 0
                ? void 0
                : s.pos) || 0,
            b =
              ((a = this.pages[this.page]) === null || a === void 0
                ? void 0
                : a.dim) || 0,
            p = this.pages.length || 1,
            f = this.isRTL ? c - b : b - c,
            g = this.isRTL ? l - h : h - l;
          d && p === 1
            ? (t <= this.page &&
                ((r.current[this.axis] -= f), (r.target[this.axis] -= f)),
              r.panTo({ [this.isHorizontal ? "x" : "y"]: -1 * h }))
            : g &&
              t <= this.page &&
              ((r.target[this.axis] -= g),
              (r.current[this.axis] -= g),
              r.requestTick());
        }
        for (let h of m) this.emit("initSlide", h, h.index);
      }
      prependSlide(t) {
        this.addSlide(0, t);
      }
      appendSlide(t) {
        this.addSlide(this.slides.length, t);
      }
      removeSlide(t) {
        let e = this.slides.length;
        t = ((t % e) + e) % e;
        let i = this.slides[t];
        if (i) {
          this.removeSlideEl(i, !0), this.slides.splice(t, 1);
          for (let n = 0; n < this.slides.length; n++) this.slides[n].index = n;
          this.updateMetrics(),
            this.slideTo(this.page, { friction: 0, transition: !1 }),
            this.emit("destroySlide", i);
        }
      }
      updateMetrics() {
        let {
          panzoom: t,
          viewport: e,
          track: i,
          slides: n,
          isHorizontal: s,
          isInfinite: a,
        } = this;
        if (!i) return;
        let r = s ? "width" : "height",
          l = s ? "offsetWidth" : "offsetHeight";
        if (e) {
          let u = Math.max(e[l], Q(e.getBoundingClientRect()[r], 1e3)),
            m = getComputedStyle(e),
            h = "padding",
            b = s ? "Right" : "Bottom";
          (u -= parseFloat(m[h + (s ? "Left" : "Top")]) + parseFloat(m[h + b])),
            (this.viewportDim = u);
        }
        let c,
          d = 0;
        for (let [u, m] of n.entries()) {
          let h = 0,
            b = 0;
          !m.el && c
            ? ((h = c.dim), (b = c.gap))
            : (({ dim: h, gap: b } = this.getSlideMetrics(m)), (c = m)),
            (h = Q(h, 1e3)),
            (b = Q(b, 1e3)),
            (m.dim = h),
            (m.gap = b),
            (m.pos = d),
            (d += h),
            (a || u < n.length - 1) && (d += b);
        }
        (d = Q(d, 1e3)),
          (this.contentDim = d),
          t &&
            ((t.contentRect[r] = d),
            (t.contentRect[s ? "fullWidth" : "fullHeight"] = d)),
          (this.pages = this.createPages()),
          (this.pages = this.processPages()),
          this.state === w.Init && this.setInitialPage(),
          (this.page = Math.max(0, Math.min(this.page, this.pages.length - 1))),
          this.manageSlideVisiblity(),
          this.emit("refresh");
      }
      getProgress(t, e = !1, i = !1) {
        t === void 0 && (t = this.page);
        let n = this,
          s = n.panzoom,
          a = n.contentDim,
          r = n.pages[t] || 0;
        if (!r || !s) return t > this.page ? -1 : 1;
        let l = -1 * s.current.e,
          c = Q((l - r.pos) / (1 * r.dim), 1e3),
          d = c,
          u = c;
        this.isInfinite &&
          i !== !0 &&
          ((d = Q((l - r.pos + a) / (1 * r.dim), 1e3)),
          (u = Q((l - r.pos - a) / (1 * r.dim), 1e3)));
        let m = [c, d, u].reduce(function (h, b) {
          return Math.abs(b) < Math.abs(h) ? b : h;
        });
        return e ? m : m > 1 ? 1 : m < -1 ? -1 : m;
      }
      setViewportHeight() {
        let { page: t, pages: e, viewport: i, isHorizontal: n } = this;
        if (!i || !e[t]) return;
        let s = 0;
        n &&
          this.track &&
          ((this.track.style.height = "auto"),
          e[t].slides.forEach((a) => {
            a.el && (s = Math.max(s, a.el.offsetHeight));
          })),
          (i.style.height = s ? `${s}px` : "");
      }
      getPageForSlide(t) {
        for (let e of this.pages)
          for (let i of e.slides) if (i.index === t) return e.index;
        return -1;
      }
      getVisibleSlides(t = 0) {
        var e;
        let i = new Set(),
          {
            panzoom: n,
            contentDim: s,
            viewportDim: a,
            pages: r,
            page: l,
          } = this;
        if (a) {
          s =
            s +
              ((e = this.slides[this.slides.length - 1]) === null ||
              e === void 0
                ? void 0
                : e.gap) || 0;
          let c = 0;
          (c =
            n && n.state !== U.Init && n.state !== U.Destroy
              ? -1 * n.current[this.axis]
              : (r[l] && r[l].pos) || 0),
            this.isInfinite && (c -= Math.floor(c / s) * s),
            this.isRTL && this.isHorizontal && (c *= -1);
          let d = c - a * t,
            u = c + a * (t + 1),
            m = this.isInfinite ? [-1, 0, 1] : [0];
          for (let h of this.slides)
            for (let b of m) {
              let p = h.pos + b * s,
                f = p + h.dim + h.gap;
              p < u && f > d && i.add(h);
            }
        }
        return i;
      }
      getPageFromPosition(t) {
        let {
            viewportDim: e,
            contentDim: i,
            slides: n,
            pages: s,
            panzoom: a,
          } = this,
          r = s.length,
          l = n.length,
          c = n[0],
          d = n[l - 1],
          u = this.option("center"),
          m = 0,
          h = 0,
          b = 0,
          p = t === void 0 ? -1 * (a?.target[this.axis] || 0) : t;
        u && (p += 0.5 * e),
          this.isInfinite
            ? (p < c.pos - 0.5 * d.gap && ((p -= i), (b = -1)),
              p > d.pos + d.dim + 0.5 * d.gap && ((p -= i), (b = 1)))
            : (p = Math.max(c.pos || 0, Math.min(p, d.pos)));
        let f = d,
          g = n.find((F) => {
            let v = F.pos - 0.5 * f.gap,
              B = F.pos + F.dim + 0.5 * F.gap;
            return (f = F), p >= v && p < B;
          });
        return (
          g || (g = d),
          (h = this.getPageForSlide(g.index)),
          (m = h + b * r),
          { page: m, pageIndex: h }
        );
      }
      setPageFromPosition() {
        let { pageIndex: t } = this.getPageFromPosition();
        this.onChange(t);
      }
      destroy() {
        if ([w.Destroy].includes(this.state)) return;
        this.state = w.Destroy;
        let {
            container: t,
            viewport: e,
            track: i,
            slides: n,
            panzoom: s,
          } = this,
          a = this.option("classes");
        t.removeEventListener("click", this.onClick, {
          passive: !1,
          capture: !1,
        }),
          t.removeEventListener("slideTo", this.onSlideTo),
          window.removeEventListener("resize", this.onResize),
          s && (s.destroy(), (this.panzoom = null)),
          n &&
            n.forEach((l) => {
              this.removeSlideEl(l);
            }),
          this.detachPlugins(),
          e &&
            (e.removeEventListener("scroll", this.onScroll),
            e.offsetParent &&
              i &&
              i.offsetParent &&
              e.replaceWith(...i.childNodes));
        for (let [l, c] of Object.entries(a))
          l !== "container" && c && t.classList.remove(c);
        (this.track = null),
          (this.viewport = null),
          (this.page = 0),
          (this.slides = []);
        let r = this.events.get("ready");
        (this.events = new Map()), r && this.events.set("ready", r);
      }
    };
  Object.defineProperty(ct, "Panzoom", {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: nt,
  }),
    Object.defineProperty(ct, "defaults", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: Hn,
    }),
    Object.defineProperty(ct, "Plugins", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: Kn,
    });
  var Gi = function (o) {
      if (!C(o)) return 0;
      let t = window.scrollY,
        e = window.innerHeight,
        i = t + e,
        n = o.getBoundingClientRect(),
        s = n.y + t,
        a = n.height,
        r = s + a;
      if (t > r || i < s) return 0;
      if ((t < s && i > r) || (s < t && r > i)) return 100;
      let l = a;
      s < t && (l -= t - s), r > i && (l -= r - i);
      let c = (l / e) * 100;
      return Math.round(c);
    },
    gt = !(
      typeof window > "u" ||
      !window.document ||
      !window.document.createElement
    ),
    Ae,
    We = [
      "a[href]",
      "area[href]",
      'input:not([disabled]):not([type="hidden"]):not([aria-hidden])',
      "select:not([disabled]):not([aria-hidden])",
      "textarea:not([disabled]):not([aria-hidden])",
      "button:not([disabled]):not([aria-hidden]):not(.fancybox-focus-guard)",
      "iframe",
      "object",
      "embed",
      "video",
      "audio",
      "[contenteditable]",
      '[tabindex]:not([tabindex^="-"]):not([disabled]):not([aria-hidden])',
    ].join(","),
    Fi = (o) => {
      if (o && gt) {
        Ae === void 0 &&
          document.createElement("div").focus({
            get preventScroll() {
              return (Ae = !0), !1;
            },
          });
        try {
          if (Ae) o.focus({ preventScroll: !0 });
          else {
            let t = window.scrollY || document.body.scrollTop,
              e = window.scrollX || document.body.scrollLeft;
            o.focus(),
              document.body.scrollTo({ top: t, left: e, behavior: "auto" });
          }
        } catch {}
      }
    },
    Vi = () => {
      let o = document,
        t,
        e = "",
        i = "",
        n = "";
      return (
        o.fullscreenEnabled
          ? ((e = "requestFullscreen"),
            (i = "exitFullscreen"),
            (n = "fullscreenElement"))
          : o.webkitFullscreenEnabled &&
            ((e = "webkitRequestFullscreen"),
            (i = "webkitExitFullscreen"),
            (n = "webkitFullscreenElement")),
        e &&
          (t = {
            request: function (s = o.documentElement) {
              return e === "webkitRequestFullscreen"
                ? s[e](Element.ALLOW_KEYBOARD_INPUT)
                : s[e]();
            },
            exit: function () {
              return o[n] && o[i]();
            },
            isFullscreen: function () {
              return o[n];
            },
          }),
        t
      );
    },
    Ie = {
      animated: !0,
      autoFocus: !0,
      backdropClick: "close",
      Carousel: {
        classes: {
          container: "fancybox__carousel",
          viewport: "fancybox__viewport",
          track: "fancybox__track",
          slide: "fancybox__slide",
        },
      },
      closeButton: "auto",
      closeExisting: !1,
      commonCaption: !1,
      compact: () =>
        window.matchMedia("(max-width: 578px), (max-height: 578px)").matches,
      contentClick: "toggleZoom",
      contentDblClick: !1,
      defaultType: "image",
      defaultDisplay: "flex",
      dragToClose: !0,
      Fullscreen: { autoStart: !1 },
      groupAll: !1,
      groupAttr: "data-fancybox",
      hideClass: "f-fadeOut",
      hideScrollbar: !0,
      idle: 3500,
      keyboard: {
        Escape: "close",
        Delete: "close",
        Backspace: "close",
        PageUp: "next",
        PageDown: "prev",
        ArrowUp: "prev",
        ArrowDown: "next",
        ArrowRight: "next",
        ArrowLeft: "prev",
      },
      l10n: Object.assign(Object.assign({}, Xi), {
        CLOSE: "Close",
        NEXT: "Next",
        PREV: "Previous",
        MODAL: "You can close this modal content with the ESC key",
        ERROR: "Something Went Wrong, Please Try Again Later",
        IMAGE_ERROR: "Image Not Found",
        ELEMENT_NOT_FOUND: "HTML Element Not Found",
        AJAX_NOT_FOUND: "Error Loading AJAX : Not Found",
        AJAX_FORBIDDEN: "Error Loading AJAX : Forbidden",
        IFRAME_ERROR: "Error Loading Page",
        TOGGLE_ZOOM: "Toggle zoom level",
        TOGGLE_THUMBS: "Toggle thumbnails",
        TOGGLE_SLIDESHOW: "Toggle slideshow",
        TOGGLE_FULLSCREEN: "Toggle full-screen mode",
        DOWNLOAD: "Download",
      }),
      parentEl: null,
      placeFocusBack: !0,
      showClass: "f-zoomInUp",
      startIndex: 0,
      tpl: {
        closeButton:
          '<button data-fancybox-close class="f-button is-close-btn" title="{{CLOSE}}"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" tabindex="-1"><path d="M20 20L4 4m16 0L4 20"/></svg></button>',
        main: `<div class="fancybox__container" role="dialog" aria-modal="true" aria-label="{{MODAL}}" tabindex="-1">
    <div class="fancybox__backdrop"></div>
    <div class="fancybox__carousel"></div>
    <div class="fancybox__footer"></div>
  </div>`,
      },
      trapFocus: !0,
      wheel: "zoom",
    },
    A,
    Z;
  (function (o) {
    (o[(o.Init = 0)] = "Init"),
      (o[(o.Ready = 1)] = "Ready"),
      (o[(o.Closing = 2)] = "Closing"),
      (o[(o.CustomClosing = 3)] = "CustomClosing"),
      (o[(o.Destroy = 4)] = "Destroy");
  })(A || (A = {})),
    (function (o) {
      (o[(o.Loading = 0)] = "Loading"),
        (o[(o.Opening = 1)] = "Opening"),
        (o[(o.Ready = 2)] = "Ready"),
        (o[(o.Closing = 3)] = "Closing");
    })(Z || (Z = {}));
  var yi = "",
    ft = !1,
    Yt = !1,
    et = null,
    Ii = () => {
      let o = "",
        t = "",
        e = M.getInstance();
      if (e) {
        let i = e.carousel,
          n = e.getSlide();
        if (i && n) {
          let s = n.slug || void 0,
            a = n.triggerEl || void 0;
          (t = s || e.option("slug") || ""),
            !t && a && a.dataset && (t = a.dataset.fancybox || ""),
            t &&
              t !== "true" &&
              (o =
                "#" +
                t +
                (!s && i.slides.length > 1 ? "-" + (n.index + 1) : ""));
        }
      }
      return { hash: o, slug: t, index: 1 };
    },
    zt = () => {
      let o = new URL(document.URL).hash,
        t = o.slice(1).split("-"),
        e = t[t.length - 1],
        i = (e && /^\+?\d+$/.test(e) && parseInt(t.pop() || "1", 10)) || 1;
      return { hash: o, slug: t.join("-"), index: i };
    },
    Si = () => {
      let { slug: o, index: t } = zt();
      if (!o) return;
      let e = document.querySelector(`[data-slug="${o}"]`);
      if (
        (e &&
          e.dispatchEvent(
            new CustomEvent("click", { bubbles: !0, cancelable: !0 }),
          ),
        M.getInstance())
      )
        return;
      let i = document.querySelectorAll(`[data-fancybox="${o}"]`);
      i.length &&
        ((e = i[t - 1]),
        e &&
          e.dispatchEvent(
            new CustomEvent("click", { bubbles: !0, cancelable: !0 }),
          ));
    },
    zi = () => {
      if (M.defaults.Hash === !1) return;
      let o = M.getInstance();
      if (o?.options.Hash === !1) return;
      let { slug: t, index: e } = zt(),
        { slug: i } = Ii();
      o && (t === i ? o.jumpTo(e - 1) : ((ft = !0), o.close())), Si();
    },
    Ti = () => {
      et && clearTimeout(et),
        queueMicrotask(() => {
          zi();
        });
    },
    vi = () => {
      window.addEventListener("hashchange", Ti, !1),
        setTimeout(() => {
          zi();
        }, 500);
    };
  gt &&
    (/complete|interactive|loaded/.test(document.readyState)
      ? vi()
      : document.addEventListener("DOMContentLoaded", vi));
  var Ot = "is-zooming-in",
    Tt = class extends D {
      onCreateSlide(t, e, i) {
        let n = this.instance.optionFor(i, "src") || "";
        i.el &&
          i.type === "image" &&
          typeof n == "string" &&
          this.setImage(i, n);
      }
      onRemoveSlide(t, e, i) {
        i.panzoom && i.panzoom.destroy(),
          (i.panzoom = void 0),
          (i.imageEl = void 0);
      }
      onChange(t, e, i, n) {
        x(this.instance.container, Ot);
        for (let s of e.slides) {
          let a = s.panzoom;
          a && s.index !== i && a.reset(0.35);
        }
      }
      onClose() {
        var t;
        let e = this.instance,
          i = e.container,
          n = e.getSlide();
        if (!i || !i.parentElement || !n) return;
        let { el: s, contentEl: a, panzoom: r, thumbElSrc: l } = n;
        if (
          !s ||
          !l ||
          !a ||
          !r ||
          r.isContentLoading ||
          r.state === U.Init ||
          r.state === U.Destroy
        )
          return;
        r.updateMetrics();
        let c = this.getZoomInfo(n);
        if (!c) return;
        (this.instance.state = A.CustomClosing),
          i.classList.remove(Ot),
          i.classList.add("is-zooming-out"),
          (a.style.backgroundImage = `url('${l}')`);
        let d = i.getBoundingClientRect();
        (((t = window.visualViewport) === null || t === void 0
          ? void 0
          : t.scale) || 1) === 1 &&
          Object.assign(i.style, {
            position: "absolute",
            top: `${i.offsetTop + window.scrollY}px`,
            left: `${i.offsetLeft + window.scrollX}px`,
            bottom: "auto",
            right: "auto",
            width: `${d.width}px`,
            height: `${d.height}px`,
            overflow: "hidden",
          });
        let { x: u, y: m, scale: h, opacity: b } = c;
        if (b) {
          let p = ((f, g, F, v) => {
            let B = g - f,
              k = v - F;
            return (X) => F + (((X - f) / B) * k || 0);
          })(r.scale, h, 1, 0);
          r.on("afterTransform", () => {
            a.style.opacity = p(r.scale) + "";
          });
        }
        r.on("endAnimation", () => {
          e.destroy();
        }),
          (r.target.a = h),
          (r.target.b = 0),
          (r.target.c = 0),
          (r.target.d = h),
          r.panTo({
            x: u,
            y: m,
            scale: h,
            friction: b ? 0.2 : 0.33,
            ignoreBounds: !0,
          }),
          r.isResting && e.destroy();
      }
      setImage(t, e) {
        let i = this.instance;
        (t.src = e),
          this.process(t, e).then(
            (n) => {
              let { contentEl: s, imageEl: a, thumbElSrc: r, el: l } = t;
              if (i.isClosing() || !s || !a) return;
              s.offsetHeight;
              let c = !!i.isOpeningSlide(t) && this.getZoomInfo(t);
              if (this.option("protected") && l) {
                l.addEventListener("contextmenu", (m) => {
                  m.preventDefault();
                });
                let u = document.createElement("div");
                y(u, "fancybox-protected"), s.appendChild(u);
              }
              if (r && c) {
                let u = n.contentRect,
                  m = Math.max(u.fullWidth, u.fullHeight),
                  h = null;
                !c.opacity &&
                  m > 1200 &&
                  ((h = document.createElement("img")),
                  y(h, "fancybox-ghost"),
                  (h.src = r),
                  s.appendChild(h));
                let b = () => {
                  h &&
                    (y(h, "f-fadeFastOut"),
                    setTimeout(() => {
                      h && (h.remove(), (h = null));
                    }, 200));
                };
                ((d = r),
                new Promise((p, f) => {
                  let g = new Image();
                  (g.onload = p), (g.onerror = f), (g.src = d);
                })).then(
                  () => {
                    i.hideLoading(t),
                      (t.state = Z.Opening),
                      this.instance.emit("reveal", t),
                      this.zoomIn(t).then(
                        () => {
                          b(), this.instance.done(t);
                        },
                        () => {},
                      ),
                      h &&
                        setTimeout(
                          () => {
                            b();
                          },
                          m > 2500 ? 800 : 200,
                        );
                  },
                  () => {
                    i.hideLoading(t), i.revealContent(t);
                  },
                );
              } else {
                let u = this.optionFor(t, "initialSize"),
                  m = this.optionFor(t, "zoom"),
                  h = {
                    event: i.prevMouseMoveEvent || i.options.event,
                    friction: m ? 0.12 : 0,
                  },
                  b = i.optionFor(t, "showClass") || void 0,
                  p = !0;
                i.isOpeningSlide(t) &&
                  (u === "full"
                    ? n.zoomToFull(h)
                    : u === "cover"
                      ? n.zoomToCover(h)
                      : u === "max"
                        ? n.zoomToMax(h)
                        : (p = !1),
                  n.stop("current")),
                  p && b && (b = n.isDragging ? "f-fadeIn" : ""),
                  i.hideLoading(t),
                  i.revealContent(t, b);
              }
              var d;
            },
            () => {
              i.setError(t, "{{IMAGE_ERROR}}");
            },
          );
      }
      process(t, e) {
        return new Promise((i, n) => {
          var s;
          let a = this.instance,
            r = t.el;
          a.clearContent(t), a.showLoading(t);
          let l = this.optionFor(t, "content");
          if ((typeof l == "string" && (l = S(l)), !l || !C(l))) {
            if (
              ((l = document.createElement("img")),
              l instanceof HTMLImageElement)
            ) {
              let c = "",
                d = t.caption;
              (c =
                typeof d == "string" && d
                  ? d.replace(/<[^>]+>/gi, "").substring(0, 1e3)
                  : `Image ${t.index + 1} of ${((s = a.carousel) === null || s === void 0 ? void 0 : s.pages.length) || 1}`),
                (l.src = e || ""),
                (l.alt = c),
                (l.draggable = !1),
                t.srcset && l.setAttribute("srcset", t.srcset),
                this.instance.isOpeningSlide(t) && (l.fetchPriority = "high");
            }
            t.sizes && l.setAttribute("sizes", t.sizes);
          }
          y(l, "fancybox-image"),
            (t.imageEl = l),
            a.setContent(t, l, !1),
            (t.panzoom = new nt(
              r,
              E({ transformParent: !0 }, this.option("Panzoom") || {}, {
                content: l,
                width: (c, d) => a.optionFor(t, "width", "auto", d) || "auto",
                height: (c, d) => a.optionFor(t, "height", "auto", d) || "auto",
                wheel: () => {
                  let c = a.option("wheel");
                  return (c === "zoom" || c == "pan") && c;
                },
                click: (c, d) => {
                  var u, m;
                  if (
                    a.isCompact ||
                    a.isClosing() ||
                    t.index !==
                      ((u = a.getSlide()) === null || u === void 0
                        ? void 0
                        : u.index)
                  )
                    return !1;
                  if (d) {
                    let b = d.composedPath()[0];
                    if (
                      [
                        "A",
                        "BUTTON",
                        "TEXTAREA",
                        "OPTION",
                        "INPUT",
                        "SELECT",
                        "VIDEO",
                      ].includes(b.nodeName)
                    )
                      return !1;
                  }
                  let h =
                    !d ||
                    (d.target &&
                      ((m = t.contentEl) === null || m === void 0
                        ? void 0
                        : m.contains(d.target)));
                  return a.option(h ? "contentClick" : "backdropClick") || !1;
                },
                dblClick: () =>
                  a.isCompact
                    ? "toggleZoom"
                    : a.option("contentDblClick") || !1,
                spinner: !1,
                panOnlyZoomed: !0,
                wheelLimit: 1 / 0,
                on: {
                  ready: (c) => {
                    i(c);
                  },
                  error: () => {
                    n();
                  },
                  destroy: () => {
                    n();
                  },
                },
              }),
            ));
        });
      }
      zoomIn(t) {
        return new Promise((e, i) => {
          let n = this.instance,
            s = n.container,
            { panzoom: a, contentEl: r, el: l } = t;
          a && a.updateMetrics();
          let c = this.getZoomInfo(t);
          if (!(c && l && r && a && s)) return void i();
          let { x: d, y: u, scale: m, opacity: h } = c,
            b = () => {
              t.state !== Z.Closing &&
                (h &&
                  (r.style.opacity =
                    Math.max(Math.min(1, 1 - (1 - a.scale) / (1 - m)), 0) + ""),
                a.scale >= 1 && a.scale > a.targetScale - 0.1 && e(a));
            },
            p = (F) => {
              ((F.scale < 0.99 || F.scale > 1.01) && !F.isDragging) ||
                (x(s, Ot),
                (r.style.opacity = ""),
                F.off("endAnimation", p),
                F.off("touchStart", p),
                F.off("afterTransform", b),
                e(F));
            };
          a.on("endAnimation", p),
            a.on("touchStart", p),
            a.on("afterTransform", b),
            a.on(["error", "destroy"], () => {
              i();
            }),
            a.panTo({ x: d, y: u, scale: m, friction: 0, ignoreBounds: !0 }),
            a.stop("current");
          let f = {
              event:
                a.panMode === "mousemove"
                  ? n.prevMouseMoveEvent || n.options.event
                  : void 0,
            },
            g = this.optionFor(t, "initialSize");
          y(s, Ot),
            n.hideLoading(t),
            g === "full"
              ? a.zoomToFull(f)
              : g === "cover"
                ? a.zoomToCover(f)
                : g === "max"
                  ? a.zoomToMax(f)
                  : a.reset(0.172);
        });
      }
      getZoomInfo(t) {
        let { el: e, imageEl: i, thumbEl: n, panzoom: s } = t,
          a = this.instance,
          r = a.container;
        if (
          !e ||
          !i ||
          !n ||
          !s ||
          Gi(n) < 3 ||
          !this.optionFor(t, "zoom") ||
          !r ||
          a.state === A.Destroy ||
          getComputedStyle(r).getPropertyValue("--f-images-zoom") === "0"
        )
          return !1;
        let l = window.visualViewport || null;
        if ((l ? l.scale : 1) !== 1) return !1;
        let {
            top: c,
            left: d,
            width: u,
            height: m,
          } = n.getBoundingClientRect(),
          { top: h, left: b, fitWidth: p, fitHeight: f } = s.contentRect;
        if (!(u && m && p && f)) return !1;
        let g = s.container.getBoundingClientRect();
        (b += g.left), (h += g.top);
        let F = -1 * (b + 0.5 * p - (d + 0.5 * u)),
          v = -1 * (h + 0.5 * f - (c + 0.5 * m)),
          B = u / p,
          k = this.option("zoomOpacity") || !1;
        return (
          k === "auto" && (k = Math.abs(u / m - p / f) > 0.1),
          { x: F, y: v, scale: B, opacity: k }
        );
      }
      attach() {
        let t = this,
          e = t.instance;
        e.on("Carousel.change", t.onChange),
          e.on("Carousel.createSlide", t.onCreateSlide),
          e.on("Carousel.removeSlide", t.onRemoveSlide),
          e.on("close", t.onClose);
      }
      detach() {
        let t = this,
          e = t.instance;
        e.off("Carousel.change", t.onChange),
          e.off("Carousel.createSlide", t.onCreateSlide),
          e.off("Carousel.removeSlide", t.onRemoveSlide),
          e.off("close", t.onClose);
      }
    };
  Object.defineProperty(Tt, "defaults", {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: {
      initialSize: "fit",
      Panzoom: { maxScale: 1 },
      protected: !1,
      zoom: !0,
      zoomOpacity: "auto",
    },
  }),
    typeof SuppressedError == "function" && SuppressedError;
  var Ze = "html",
    Bi = "image",
    Ce = "map",
    J = "youtube",
    q = "vimeo",
    bt = "html5video",
    xi = (o, t = {}) => {
      let e = new URL(o),
        i = new URLSearchParams(e.search),
        n = new URLSearchParams();
      for (let [r, l] of [...i, ...Object.entries(t)]) {
        let c = l + "";
        if (r === "t") {
          let d = c.match(/((\d*)m)?(\d*)s?/);
          d &&
            n.set(
              "start",
              60 * parseInt(d[2] || "0") + parseInt(d[3] || "0") + "",
            );
        } else n.set(r, c);
      }
      let s = n + "",
        a = o.match(/#t=((.*)?\d+s)/);
      return a && (s += `#t=${a[1]}`), s;
    },
    qn = {
      ajax: null,
      autoSize: !0,
      iframeAttr: { allow: "autoplay; fullscreen", scrolling: "auto" },
      preload: !0,
      videoAutoplay: !0,
      videoRatio: 16 / 9,
      videoTpl: `<video class="fancybox__html5video" playsinline controls controlsList="nodownload" poster="{{poster}}">
  <source src="{{src}}" type="{{format}}" />Sorry, your browser doesn't support embedded videos.</video>`,
      videoFormat: "",
      vimeo: { byline: 1, color: "00adef", controls: 1, dnt: 1, muted: 0 },
      youtube: { controls: 1, enablejsapi: 1, nocookie: 1, rel: 0, fs: 1 },
    },
    $n = [
      "image",
      "html",
      "ajax",
      "inline",
      "clone",
      "iframe",
      "map",
      "pdf",
      "html5video",
      "youtube",
      "vimeo",
    ],
    jt = class extends D {
      onBeforeInitSlide(t, e, i) {
        this.processType(i);
      }
      onCreateSlide(t, e, i) {
        this.setContent(i);
      }
      onClearContent(t, e) {
        e.xhr && (e.xhr.abort(), (e.xhr = null));
        let i = e.iframeEl;
        i &&
          ((i.onload = i.onerror = null),
          (i.src = "//about:blank"),
          (e.iframeEl = null));
        let n = e.contentEl,
          s = e.placeholderEl;
        if (e.type === "inline" && n && s)
          n.classList.remove("fancybox__content"),
            getComputedStyle(n).getPropertyValue("display") !== "none" &&
              (n.style.display = "none"),
            setTimeout(() => {
              s &&
                (n && s.parentNode && s.parentNode.insertBefore(n, s),
                s.remove());
            }, 0),
            (e.contentEl = void 0),
            (e.placeholderEl = void 0);
        else
          for (; e.el && e.el.firstChild; ) e.el.removeChild(e.el.firstChild);
      }
      onSelectSlide(t, e, i) {
        i.state === Z.Ready && this.playVideo();
      }
      onUnselectSlide(t, e, i) {
        var n, s;
        if (i.type === bt) {
          try {
            (s =
              (n = i.el) === null || n === void 0
                ? void 0
                : n.querySelector("video")) === null ||
              s === void 0 ||
              s.pause();
          } catch {}
          return;
        }
        let a;
        i.type === q
          ? (a = { method: "pause", value: "true" })
          : i.type === J && (a = { event: "command", func: "pauseVideo" }),
          a &&
            i.iframeEl &&
            i.iframeEl.contentWindow &&
            i.iframeEl.contentWindow.postMessage(JSON.stringify(a), "*"),
          i.poller && clearTimeout(i.poller);
      }
      onDone(t, e) {
        t.isCurrentSlide(e) && !t.isClosing() && this.playVideo();
      }
      onRefresh(t, e) {
        e.slides.forEach((i) => {
          i.el && (this.resizeIframe(i), this.setAspectRatio(i));
        });
      }
      onMessage(t) {
        try {
          let e = JSON.parse(t.data);
          if (t.origin === "https://player.vimeo.com") {
            if (e.event === "ready")
              for (let i of Array.from(
                document.getElementsByClassName("fancybox__iframe"),
              ))
                i instanceof HTMLIFrameElement &&
                  i.contentWindow === t.source &&
                  (i.dataset.ready = "true");
          } else if (
            t.origin.match(/^https:\/\/(www.)?youtube(-nocookie)?.com$/) &&
            e.event === "onReady"
          ) {
            let i = document.getElementById(e.id);
            i && (i.dataset.ready = "true");
          }
        } catch {}
      }
      loadAjaxContent(t) {
        let e = this.instance.optionFor(t, "src") || "";
        this.instance.showLoading(t);
        let i = this.instance,
          n = new XMLHttpRequest();
        i.showLoading(t),
          (n.onreadystatechange = function () {
            n.readyState === XMLHttpRequest.DONE &&
              i.state === A.Ready &&
              (i.hideLoading(t),
              n.status === 200
                ? i.setContent(t, n.responseText)
                : i.setError(
                    t,
                    n.status === 404
                      ? "{{AJAX_NOT_FOUND}}"
                      : "{{AJAX_FORBIDDEN}}",
                  ));
          });
        let s = t.ajax || null;
        n.open(s ? "POST" : "GET", e + ""),
          n.setRequestHeader(
            "Content-Type",
            "application/x-www-form-urlencoded",
          ),
          n.setRequestHeader("X-Requested-With", "XMLHttpRequest"),
          n.send(s),
          (t.xhr = n);
      }
      setInlineContent(t) {
        let e = null;
        if (C(t.src)) e = t.src;
        else if (typeof t.src == "string") {
          let i = t.src.split("#", 2).pop();
          e = i ? document.getElementById(i) : null;
        }
        if (e) {
          if (t.type === "clone" || e.closest(".fancybox__slide")) {
            e = e.cloneNode(!0);
            let i = e.dataset.animationName;
            i && (e.classList.remove(i), delete e.dataset.animationName);
            let n = e.getAttribute("id");
            (n = n ? `${n}--clone` : `clone-${this.instance.id}-${t.index}`),
              e.setAttribute("id", n);
          } else if (e.parentNode) {
            let i = document.createElement("div");
            i.classList.add("fancybox-placeholder"),
              e.parentNode.insertBefore(i, e),
              (t.placeholderEl = i);
          }
          this.instance.setContent(t, e);
        } else this.instance.setError(t, "{{ELEMENT_NOT_FOUND}}");
      }
      setIframeContent(t) {
        let { src: e, el: i } = t;
        if (!e || typeof e != "string" || !i) return;
        i.classList.add("is-loading");
        let n = this.instance,
          s = document.createElement("iframe");
        (s.className = "fancybox__iframe"),
          s.setAttribute("id", `fancybox__iframe_${n.id}_${t.index}`);
        for (let [r, l] of Object.entries(
          this.optionFor(t, "iframeAttr") || {},
        ))
          s.setAttribute(r, l);
        (s.onerror = () => {
          n.setError(t, "{{IFRAME_ERROR}}");
        }),
          (t.iframeEl = s);
        let a = this.optionFor(t, "preload");
        if (t.type !== "iframe" || a === !1)
          return (
            s.setAttribute("src", t.src + ""),
            n.setContent(t, s, !1),
            this.resizeIframe(t),
            void n.revealContent(t)
          );
        n.showLoading(t),
          (s.onload = () => {
            if (!s.src.length) return;
            let r = s.dataset.ready !== "true";
            (s.dataset.ready = "true"),
              this.resizeIframe(t),
              r ? n.revealContent(t) : n.hideLoading(t);
          }),
          s.setAttribute("src", e),
          n.setContent(t, s, !1);
      }
      resizeIframe(t) {
        let { type: e, iframeEl: i } = t;
        if (e === J || e === q) return;
        let n = i?.parentElement;
        if (!i || !n) return;
        let s = t.autoSize;
        s === void 0 && (s = this.optionFor(t, "autoSize"));
        let a = t.width || 0,
          r = t.height || 0;
        a && r && (s = !1);
        let l = n && n.style;
        if (t.preload !== !1 && s !== !1 && l)
          try {
            let c = window.getComputedStyle(n),
              d = parseFloat(c.paddingLeft) + parseFloat(c.paddingRight),
              u = parseFloat(c.paddingTop) + parseFloat(c.paddingBottom),
              m = i.contentWindow;
            if (m) {
              let h = m.document,
                b = h.getElementsByTagName(Ze)[0],
                p = h.body;
              (l.width = ""),
                (p.style.overflow = "hidden"),
                (a = a || b.scrollWidth + d),
                (l.width = `${a}px`),
                (p.style.overflow = ""),
                (l.flex = "0 0 auto"),
                (l.height = `${p.scrollHeight}px`),
                (r = b.scrollHeight + u);
            }
          } catch {}
        if (a || r) {
          let c = { flex: "0 1 auto", width: "", height: "" };
          a && a !== "auto" && (c.width = `${a}px`),
            r && r !== "auto" && (c.height = `${r}px`),
            Object.assign(l, c);
        }
      }
      playVideo() {
        let t = this.instance.getSlide();
        if (!t) return;
        let { el: e } = t;
        if (!e || !e.offsetParent || !this.optionFor(t, "videoAutoplay"))
          return;
        if (t.type === bt)
          try {
            let n = e.querySelector("video");
            if (n) {
              let s = n.play();
              s !== void 0 &&
                s
                  .then(() => {})
                  .catch((a) => {
                    (n.muted = !0), n.play();
                  });
            }
          } catch {}
        if (t.type !== J && t.type !== q) return;
        let i = () => {
          if (t.iframeEl && t.iframeEl.contentWindow) {
            let n;
            if (t.iframeEl.dataset.ready === "true")
              return (
                (n =
                  t.type === J
                    ? { event: "command", func: "playVideo" }
                    : { method: "play", value: "true" }),
                n &&
                  t.iframeEl.contentWindow.postMessage(JSON.stringify(n), "*"),
                void (t.poller = void 0)
              );
            t.type === J &&
              ((n = { event: "listening", id: t.iframeEl.getAttribute("id") }),
              t.iframeEl.contentWindow.postMessage(JSON.stringify(n), "*"));
          }
          t.poller = setTimeout(i, 250);
        };
        i();
      }
      processType(t) {
        if (t.html) return (t.type = Ze), (t.src = t.html), void (t.html = "");
        let e = this.instance.optionFor(t, "src", "");
        if (!e || typeof e != "string") return;
        let i = t.type,
          n = null;
        if (
          (n = e.match(
            /(youtube\.com|youtu\.be|youtube\-nocookie\.com)\/(?:watch\?(?:.*&)?v=|v\/|u\/|shorts\/|embed\/?)?(videoseries\?list=(?:.*)|[\w-]{11}|\?listType=(?:.*)&list=(?:.*))(?:.*)/i,
          ))
        ) {
          let s = this.optionFor(t, J),
            { nocookie: a } = s,
            r = (function (u, m) {
              var h = {};
              for (var b in u)
                Object.prototype.hasOwnProperty.call(u, b) &&
                  m.indexOf(b) < 0 &&
                  (h[b] = u[b]);
              if (
                u != null &&
                typeof Object.getOwnPropertySymbols == "function"
              ) {
                var p = 0;
                for (b = Object.getOwnPropertySymbols(u); p < b.length; p++)
                  m.indexOf(b[p]) < 0 &&
                    Object.prototype.propertyIsEnumerable.call(u, b[p]) &&
                    (h[b[p]] = u[b[p]]);
              }
              return h;
            })(s, ["nocookie"]),
            l = `www.youtube${a ? "-nocookie" : ""}.com`,
            c = xi(e, r),
            d = encodeURIComponent(n[2]);
          (t.videoId = d),
            (t.src = `https://${l}/embed/${d}?${c}`),
            (t.thumbSrc =
              t.thumbSrc || `https://i.ytimg.com/vi/${d}/mqdefault.jpg`),
            (i = J);
        } else if (
          (n = e.match(
            /^.+vimeo.com\/(?:\/)?([\d]+)((\/|\?h=)([a-z0-9]+))?(.*)?/,
          ))
        ) {
          let s = xi(e, this.optionFor(t, q)),
            a = encodeURIComponent(n[1]),
            r = n[4] || "";
          (t.videoId = a),
            (t.src = `https://player.vimeo.com/video/${a}?${r ? `h=${r}${s ? "&" : ""}` : ""}${s}`),
            (i = q);
        }
        if (!i && t.triggerEl) {
          let s = t.triggerEl.dataset.type;
          $n.includes(s) && (i = s);
        }
        i ||
          (typeof e == "string" &&
            (e.charAt(0) === "#"
              ? (i = "inline")
              : (n = e.match(/\.(mp4|mov|ogv|webm)((\?|#).*)?$/i))
                ? ((i = bt),
                  (t.videoFormat =
                    t.videoFormat ||
                    "video/" + (n[1] === "ogv" ? "ogg" : n[1])))
                : e.match(
                      /(^data:image\/[a-z0-9+\/=]*,)|(\.(jp(e|g|eg)|gif|png|bmp|webp|svg|ico)((\?|#).*)?$)/i,
                    )
                  ? (i = Bi)
                  : e.match(/\.(pdf)((\?|#).*)?$/i) && (i = "pdf"))),
          (n = e.match(
            /(?:maps\.)?google\.([a-z]{2,3}(?:\.[a-z]{2})?)\/(?:(?:(?:maps\/(?:place\/(?:.*)\/)?\@(.*),(\d+.?\d+?)z))|(?:\?ll=))(.*)?/i,
          ))
            ? ((t.src = `https://maps.google.${n[1]}/?ll=${(n[2] ? n[2] + "&z=" + Math.floor(parseFloat(n[3])) + (n[4] ? n[4].replace(/^\//, "&") : "") : n[4] + "").replace(/\?/, "&")}&output=${n[4] && n[4].indexOf("layer=c") > 0 ? "svembed" : "embed"}`),
              (i = Ce))
            : (n = e.match(
                /(?:maps\.)?google\.([a-z]{2,3}(?:\.[a-z]{2})?)\/(?:maps\/search\/)(.*)/i,
              )) &&
              ((t.src = `https://maps.google.${n[1]}/maps?q=${n[2].replace("query=", "q=").replace("api=1", "")}&output=embed`),
              (i = Ce)),
          (i = i || this.instance.option("defaultType")),
          (t.type = i),
          i === Bi && (t.thumbSrc = t.thumbSrc || t.src);
      }
      setContent(t) {
        let e = this.instance.optionFor(t, "src") || "";
        if (t && t.type && e) {
          switch (t.type) {
            case Ze:
              this.instance.setContent(t, e);
              break;
            case bt:
              let i = this.option("videoTpl");
              i &&
                this.instance.setContent(
                  t,
                  i
                    .replace(/\{\{src\}\}/gi, e + "")
                    .replace(
                      /\{\{format\}\}/gi,
                      this.optionFor(t, "videoFormat") || "",
                    )
                    .replace(/\{\{poster\}\}/gi, t.poster || t.thumbSrc || ""),
                );
              break;
            case "inline":
            case "clone":
              this.setInlineContent(t);
              break;
            case "ajax":
              this.loadAjaxContent(t);
              break;
            case "pdf":
            case Ce:
            case J:
            case q:
              t.preload = !1;
            case "iframe":
              this.setIframeContent(t);
          }
          this.setAspectRatio(t);
        }
      }
      setAspectRatio(t) {
        let e = t.contentEl;
        if (!(t.el && e && t.type && [J, q, bt].includes(t.type))) return;
        let i,
          n = t.width || "auto",
          s = t.height || "auto";
        if (n === "auto" || s === "auto") {
          i = this.optionFor(t, "videoRatio");
          let c = (i + "").match(/(\d+)\s*\/\s?(\d+)/);
          i =
            c && c.length > 2
              ? parseFloat(c[1]) / parseFloat(c[2])
              : parseFloat(i + "");
        } else n && s && (i = n / s);
        if (!i) return;
        (e.style.aspectRatio = ""),
          (e.style.width = ""),
          (e.style.height = ""),
          e.offsetHeight;
        let a = e.getBoundingClientRect(),
          r = a.width || 1,
          l = a.height || 1;
        (e.style.aspectRatio = i + ""),
          i < r / l
            ? ((s = s === "auto" ? l : Math.min(l, s)),
              (e.style.width = "auto"),
              (e.style.height = `${s}px`))
            : ((n = n === "auto" ? r : Math.min(r, n)),
              (e.style.width = `${n}px`),
              (e.style.height = "auto"));
      }
      attach() {
        let t = this,
          e = t.instance;
        e.on("Carousel.beforeInitSlide", t.onBeforeInitSlide),
          e.on("Carousel.createSlide", t.onCreateSlide),
          e.on("Carousel.selectSlide", t.onSelectSlide),
          e.on("Carousel.unselectSlide", t.onUnselectSlide),
          e.on("Carousel.Panzoom.refresh", t.onRefresh),
          e.on("done", t.onDone),
          e.on("clearContent", t.onClearContent),
          window.addEventListener("message", t.onMessage);
      }
      detach() {
        let t = this,
          e = t.instance;
        e.off("Carousel.beforeInitSlide", t.onBeforeInitSlide),
          e.off("Carousel.createSlide", t.onCreateSlide),
          e.off("Carousel.selectSlide", t.onSelectSlide),
          e.off("Carousel.unselectSlide", t.onUnselectSlide),
          e.off("Carousel.Panzoom.refresh", t.onRefresh),
          e.off("done", t.onDone),
          e.off("clearContent", t.onClearContent),
          window.removeEventListener("message", t.onMessage);
      }
    };
  Object.defineProperty(jt, "defaults", {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: qn,
  });
  var Nt = "play",
    Rt = "pause",
    pt = "ready",
    Jt = class extends D {
      constructor() {
        super(...arguments),
          Object.defineProperty(this, "state", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: pt,
          }),
          Object.defineProperty(this, "inHover", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: !1,
          }),
          Object.defineProperty(this, "timer", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: null,
          }),
          Object.defineProperty(this, "progressBar", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: null,
          });
      }
      get isActive() {
        return this.state !== pt;
      }
      onReady(t) {
        this.option("autoStart") &&
          (t.isInfinite || t.page < t.pages.length - 1) &&
          this.start();
      }
      onChange() {
        this.removeProgressBar(), this.pause();
      }
      onSettle() {
        this.resume();
      }
      onVisibilityChange() {
        document.visibilityState === "visible" ? this.resume() : this.pause();
      }
      onMouseEnter() {
        (this.inHover = !0), this.pause();
      }
      onMouseLeave() {
        var t;
        (this.inHover = !1),
          !((t = this.instance.panzoom) === null || t === void 0) &&
            t.isResting &&
            this.resume();
      }
      onTimerEnd() {
        let t = this.instance;
        this.state === "play" &&
          (t.isInfinite || t.page !== t.pages.length - 1
            ? t.slideNext()
            : t.slideTo(0));
      }
      removeProgressBar() {
        this.progressBar &&
          (this.progressBar.remove(), (this.progressBar = null));
      }
      createProgressBar() {
        var t;
        if (!this.option("showProgress")) return null;
        this.removeProgressBar();
        let e = this.instance,
          i =
            ((t = e.pages[e.page]) === null || t === void 0
              ? void 0
              : t.slides) || [],
          n = this.option("progressParentEl");
        if ((n || (n = (i.length === 1 ? i[0].el : null) || e.viewport), !n))
          return null;
        let s = document.createElement("div");
        return (
          y(s, "f-progress"),
          n.prepend(s),
          (this.progressBar = s),
          s.offsetHeight,
          s
        );
      }
      set() {
        let t = this,
          e = t.instance;
        if (e.pages.length < 2 || t.timer) return;
        let i = t.option("timeout");
        (t.state = Nt), y(e.container, "has-autoplay");
        let n = t.createProgressBar();
        n &&
          ((n.style.transitionDuration = `${i}ms`),
          (n.style.transform = "scaleX(1)")),
          (t.timer = setTimeout(() => {
            (t.timer = null), t.inHover || t.onTimerEnd();
          }, i)),
          t.emit("set");
      }
      clear() {
        let t = this;
        t.timer && (clearTimeout(t.timer), (t.timer = null)),
          t.removeProgressBar();
      }
      start() {
        let t = this;
        if ((t.set(), t.state !== pt)) {
          if (t.option("pauseOnHover")) {
            let e = t.instance.container;
            e.addEventListener("mouseenter", t.onMouseEnter, !1),
              e.addEventListener("mouseleave", t.onMouseLeave, !1);
          }
          document.addEventListener(
            "visibilitychange",
            t.onVisibilityChange,
            !1,
          ),
            t.emit("start");
        }
      }
      stop() {
        let t = this,
          e = t.state,
          i = t.instance.container;
        t.clear(),
          (t.state = pt),
          i.removeEventListener("mouseenter", t.onMouseEnter, !1),
          i.removeEventListener("mouseleave", t.onMouseLeave, !1),
          document.removeEventListener(
            "visibilitychange",
            t.onVisibilityChange,
            !1,
          ),
          x(i, "has-autoplay"),
          e !== pt && t.emit("stop");
      }
      pause() {
        let t = this;
        t.state === Nt && ((t.state = Rt), t.clear(), t.emit(Rt));
      }
      resume() {
        let t = this,
          e = t.instance;
        if (e.isInfinite || e.page !== e.pages.length - 1)
          if (t.state !== Nt) {
            if (t.state === Rt && !t.inHover) {
              let i = new Event("resume", { bubbles: !0, cancelable: !0 });
              t.emit("resume", i), i.defaultPrevented || t.set();
            }
          } else t.set();
        else t.stop();
      }
      toggle() {
        this.state === Nt || this.state === Rt ? this.stop() : this.start();
      }
      attach() {
        let t = this,
          e = t.instance;
        e.on("ready", t.onReady),
          e.on("Panzoom.startAnimation", t.onChange),
          e.on("Panzoom.endAnimation", t.onSettle),
          e.on("Panzoom.touchMove", t.onChange);
      }
      detach() {
        let t = this,
          e = t.instance;
        e.off("ready", t.onReady),
          e.off("Panzoom.startAnimation", t.onChange),
          e.off("Panzoom.endAnimation", t.onSettle),
          e.off("Panzoom.touchMove", t.onChange),
          t.stop();
      }
    };
  Object.defineProperty(Jt, "defaults", {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: {
      autoStart: !0,
      pauseOnHover: !0,
      progressParentEl: null,
      showProgress: !0,
      timeout: 3e3,
    },
  });
  var Ht = class extends D {
    constructor() {
      super(...arguments),
        Object.defineProperty(this, "ref", {
          enumerable: !0,
          configurable: !0,
          writable: !0,
          value: null,
        });
    }
    onPrepare(t) {
      let e = t.carousel;
      if (!e) return;
      let i = t.container;
      i &&
        ((e.options.Autoplay = E(
          { autoStart: !1 },
          this.option("Autoplay") || {},
          {
            pauseOnHover: !1,
            timeout: this.option("timeout"),
            progressParentEl: () => this.option("progressParentEl") || null,
            on: {
              start: () => {
                t.emit("startSlideshow");
              },
              set: (n) => {
                var s;
                i.classList.add("has-slideshow"),
                  ((s = t.getSlide()) === null || s === void 0
                    ? void 0
                    : s.state) !== Z.Ready && n.pause();
              },
              stop: () => {
                i.classList.remove("has-slideshow"),
                  t.isCompact || t.endIdle(),
                  t.emit("endSlideshow");
              },
              resume: (n, s) => {
                var a, r, l;
                !s ||
                  !s.cancelable ||
                  (((a = t.getSlide()) === null || a === void 0
                    ? void 0
                    : a.state) === Z.Ready &&
                    !(
                      (l =
                        (r = t.carousel) === null || r === void 0
                          ? void 0
                          : r.panzoom) === null || l === void 0
                    ) &&
                    l.isResting) ||
                  s.preventDefault();
              },
            },
          },
        )),
        e.attachPlugins({ Autoplay: Jt }),
        (this.ref = e.plugins.Autoplay));
    }
    onReady(t) {
      let e = t.carousel,
        i = this.ref;
      i &&
        e &&
        this.option("playOnStart") &&
        (e.isInfinite || e.page < e.pages.length - 1) &&
        i.start();
    }
    onDone(t, e) {
      let i = this.ref,
        n = t.carousel;
      if (!i || !n) return;
      let s = e.panzoom;
      s &&
        s.on("startAnimation", () => {
          t.isCurrentSlide(e) && i.stop();
        }),
        t.isCurrentSlide(e) && i.resume();
    }
    onKeydown(t, e) {
      var i;
      let n = this.ref;
      n &&
        e === this.option("key") &&
        ((i = document.activeElement) === null || i === void 0
          ? void 0
          : i.nodeName) !== "BUTTON" &&
        n.toggle();
    }
    attach() {
      let t = this,
        e = t.instance;
      e.on("Carousel.init", t.onPrepare),
        e.on("Carousel.ready", t.onReady),
        e.on("done", t.onDone),
        e.on("keydown", t.onKeydown);
    }
    detach() {
      let t = this,
        e = t.instance;
      e.off("Carousel.init", t.onPrepare),
        e.off("Carousel.ready", t.onReady),
        e.off("done", t.onDone),
        e.off("keydown", t.onKeydown);
    }
  };
  Object.defineProperty(Ht, "defaults", {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: {
      key: " ",
      playOnStart: !1,
      progressParentEl: (o) => {
        var t;
        return (
          ((t = o.instance.container) === null || t === void 0
            ? void 0
            : t.querySelector(
                ".fancybox__toolbar [data-fancybox-toggle-slideshow]",
              )) || o.instance.container
        );
      },
      timeout: 3e3,
    },
  });
  var ji = {
      classes: {
        container: "f-thumbs f-carousel__thumbs",
        viewport: "f-thumbs__viewport",
        track: "f-thumbs__track",
        slide: "f-thumbs__slide",
        isResting: "is-resting",
        isSelected: "is-selected",
        isLoading: "is-loading",
        hasThumbs: "has-thumbs",
      },
      minCount: 2,
      parentEl: null,
      thumbTpl:
        '<button class="f-thumbs__slide__button" tabindex="0" type="button" aria-label="{{GOTO}}" data-carousel-index="%i"><img class="f-thumbs__slide__img" data-lazy-src="{{%s}}" alt="" /></button>',
      type: "modern",
    },
    H;
  (function (o) {
    (o[(o.Init = 0)] = "Init"),
      (o[(o.Ready = 1)] = "Ready"),
      (o[(o.Hidden = 2)] = "Hidden");
  })(H || (H = {}));
  var Ui = "isResting",
    kt = "thumbWidth",
    ot = "thumbHeight",
    I = "thumbClipWidth",
    Ji = class extends D {
      constructor() {
        super(...arguments),
          Object.defineProperty(this, "type", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: "modern",
          }),
          Object.defineProperty(this, "container", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: null,
          }),
          Object.defineProperty(this, "track", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: null,
          }),
          Object.defineProperty(this, "carousel", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: null,
          }),
          Object.defineProperty(this, "thumbWidth", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: 0,
          }),
          Object.defineProperty(this, "thumbClipWidth", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: 0,
          }),
          Object.defineProperty(this, "thumbHeight", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: 0,
          }),
          Object.defineProperty(this, "thumbGap", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: 0,
          }),
          Object.defineProperty(this, "thumbExtraGap", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: 0,
          }),
          Object.defineProperty(this, "state", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: H.Init,
          });
      }
      get isModern() {
        return this.type === "modern";
      }
      onInitSlide(o, t) {
        let e = t.el ? t.el.dataset : void 0;
        e &&
          ((t.thumbSrc = e.thumbSrc || t.thumbSrc || ""),
          (t[I] = parseFloat(e[I] || "") || t[I] || 0),
          (t[ot] = parseFloat(e.thumbHeight || "") || t[ot] || 0)),
          this.addSlide(t);
      }
      onInitSlides() {
        this.build();
      }
      onChange() {
        var o;
        if (!this.isModern) return;
        let t = this.container,
          e = this.instance,
          i = e.panzoom,
          n = this.carousel,
          s = n ? n.panzoom : null,
          a = e.page;
        if (i && n && s) {
          if (i.isDragging) {
            x(t, this.cn(Ui));
            let r =
              ((o = n.pages[a]) === null || o === void 0 ? void 0 : o.pos) || 0;
            r += e.getProgress(a) * (this[I] + this.thumbGap);
            let l = s.getBounds();
            -1 * r > l.x.min &&
              -1 * r < l.x.max &&
              s.panTo({ x: -1 * r, friction: 0.12 });
          } else z(t, this.cn(Ui), i.isResting);
          this.shiftModern();
        }
      }
      onRefresh() {
        this.updateProps();
        for (let o of this.instance.slides || []) this.resizeModernSlide(o);
        this.shiftModern();
      }
      isDisabled() {
        let o = this.option("minCount") || 0;
        if (o) {
          let e = this.instance,
            i = 0;
          for (let n of e.slides || []) n.thumbSrc && i++;
          if (i < o) return !0;
        }
        let t = this.option("type");
        return ["modern", "classic"].indexOf(t) < 0;
      }
      getThumb(o) {
        let t = this.option("thumbTpl") || "";
        return {
          html: this.instance.localize(t, [
            ["%i", o.index],
            ["%d", o.index + 1],
            [
              "%s",
              o.thumbSrc ||
                "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
            ],
          ]),
        };
      }
      addSlide(o) {
        let t = this.carousel;
        t && t.addSlide(o.index, this.getThumb(o));
      }
      getSlides() {
        let o = [];
        for (let t of this.instance.slides || []) o.push(this.getThumb(t));
        return o;
      }
      resizeModernSlide(o) {
        this.isModern &&
          (o[kt] =
            o[I] && o[ot] ? Math.round(this[ot] * (o[I] / o[ot])) : this[kt]);
      }
      updateProps() {
        let o = this.container;
        if (!o) return;
        let t = (e) =>
          parseFloat(getComputedStyle(o).getPropertyValue("--f-thumb-" + e)) ||
          0;
        (this.thumbGap = t("gap")),
          (this.thumbExtraGap = t("extra-gap")),
          (this[kt] = t("width") || 40),
          (this[I] = t("clip-width") || 40),
          (this[ot] = t("height") || 40);
      }
      build() {
        let o = this;
        if (o.state !== H.Init) return;
        if (o.isDisabled()) return void o.emit("disabled");
        let t = o.instance,
          e = t.container,
          i = o.getSlides(),
          n = o.option("type");
        o.type = n;
        let s = o.option("parentEl"),
          a = o.cn("container"),
          r = o.cn("track"),
          l = s?.querySelector("." + a);
        l ||
          ((l = document.createElement("div")),
          y(l, a),
          s ? s.appendChild(l) : e.after(l)),
          y(l, `is-${n}`),
          y(e, o.cn("hasThumbs")),
          (o.container = l),
          o.updateProps();
        let c = l.querySelector("." + r);
        c ||
          ((c = document.createElement("div")),
          y(c, o.cn("track")),
          l.appendChild(c)),
          (o.track = c);
        let d = E(
            {},
            {
              track: c,
              infinite: !1,
              center: !0,
              fill: n === "classic",
              dragFree: !0,
              slidesPerPage: 1,
              transition: !1,
              preload: 0.25,
              friction: 0.12,
              Panzoom: { maxVelocity: 0 },
              Dots: !1,
              Navigation: !1,
              classes: {
                container: "f-thumbs",
                viewport: "f-thumbs__viewport",
                track: "f-thumbs__track",
                slide: "f-thumbs__slide",
              },
            },
            o.option("Carousel") || {},
            { Sync: { target: t }, slides: i },
          ),
          u = new t.constructor(l, d);
        u.on("createSlide", (m, h) => {
          o.setProps(h.index), o.emit("createSlide", h, h.el);
        }),
          u.on("ready", () => {
            o.shiftModern(), o.emit("ready");
          }),
          u.on("refresh", () => {
            o.shiftModern();
          }),
          u.on("Panzoom.click", (m, h, b) => {
            o.onClick(b);
          }),
          (o.carousel = u),
          (o.state = H.Ready);
      }
      onClick(o) {
        o.preventDefault(), o.stopPropagation();
        let t = this.instance,
          { pages: e, page: i } = t,
          n = (p) => {
            if (p) {
              let f = p.closest("[data-carousel-index]");
              if (f)
                return [parseInt(f.dataset.carouselIndex || "", 10) || 0, f];
            }
            return [-1, void 0];
          },
          s = (p, f) => {
            let g = document.elementFromPoint(p, f);
            return g ? n(g) : [-1, void 0];
          },
          [a, r] = n(o.target);
        if (a > -1) return;
        let l = this[I],
          c = o.clientX,
          d = o.clientY,
          [u, m] = s(c - l, d),
          [h, b] = s(c + l, d);
        m && b
          ? ((a =
              Math.abs(c - m.getBoundingClientRect().right) <
              Math.abs(c - b.getBoundingClientRect().left)
                ? u
                : h),
            a === i && (a = a === u ? h : u))
          : m
            ? (a = u)
            : b && (a = h),
          a > -1 && e[a] && t.slideTo(a);
      }
      getShift(o) {
        var t;
        let e = this,
          { instance: i } = e,
          n = e.carousel;
        if (!i || !n) return 0;
        let s = e[kt],
          a = e[I],
          r = e.thumbGap,
          l = e.thumbExtraGap;
        if (!(!((t = n.slides[o]) === null || t === void 0) && t.el)) return 0;
        let c = 0.5 * (s - a),
          d = i.pages.length - 1,
          u = i.getProgress(0),
          m = i.getProgress(d),
          h = i.getProgress(o, !1, !0),
          b = 0,
          p = c + l + r,
          f = u < 0 && u > -1,
          g = m > 0 && m < 1;
        return (
          o === 0
            ? ((b = p * Math.abs(u)), g && u === 1 && (b -= p * Math.abs(m)))
            : o === d
              ? ((b = p * Math.abs(m) * -1),
                f && m === -1 && (b += p * Math.abs(u)))
              : f || g
                ? ((b = -1 * p),
                  (b += p * Math.abs(u)),
                  (b += p * (1 - Math.abs(m))))
                : (b = p * h),
          b
        );
      }
      setProps(o) {
        var t;
        let e = this;
        if (!e.isModern) return;
        let { instance: i } = e,
          n = e.carousel;
        if (i && n) {
          let s = (t = n.slides[o]) === null || t === void 0 ? void 0 : t.el;
          if (s && s.childNodes.length) {
            let a = Q(1 - Math.abs(i.getProgress(o))),
              r = Q(e.getShift(o));
            s.style.setProperty("--progress", a ? a + "" : ""),
              s.style.setProperty("--shift", r + "");
          }
        }
      }
      shiftModern() {
        let o = this;
        if (!o.isModern) return;
        let { instance: t, track: e } = o,
          i = t.panzoom,
          n = o.carousel;
        if (!(t && e && i && n) || i.state === U.Init || i.state === U.Destroy)
          return;
        for (let a of t.slides) o.setProps(a.index);
        let s = (o[I] + o.thumbGap) * (n.slides.length || 0);
        e.style.setProperty("--width", s + "");
      }
      cleanup() {
        let o = this;
        o.carousel && o.carousel.destroy(),
          (o.carousel = null),
          o.container && o.container.remove(),
          (o.container = null),
          o.track && o.track.remove(),
          (o.track = null),
          (o.state = H.Init),
          x(o.instance.container, o.cn("hasThumbs"));
      }
      attach() {
        let o = this,
          t = o.instance;
        t.on("initSlide", o.onInitSlide),
          t.state === w.Init
            ? t.on("initSlides", o.onInitSlides)
            : o.onInitSlides(),
          t.on(["change", "Panzoom.afterTransform"], o.onChange),
          t.on("Panzoom.refresh", o.onRefresh);
      }
      detach() {
        let o = this,
          t = o.instance;
        t.off("initSlide", o.onInitSlide),
          t.off("initSlides", o.onInitSlides),
          t.off(["change", "Panzoom.afterTransform"], o.onChange),
          t.off("Panzoom.refresh", o.onRefresh),
          o.cleanup();
      }
    };
  Object.defineProperty(Ji, "defaults", {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: ji,
  });
  var ts = Object.assign(Object.assign({}, ji), {
      key: "t",
      showOnStart: !0,
      parentEl: null,
    }),
    Li = "is-masked",
    wi = "aria-hidden",
    Pt = class extends D {
      constructor() {
        super(...arguments),
          Object.defineProperty(this, "ref", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: null,
          }),
          Object.defineProperty(this, "hidden", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: !1,
          });
      }
      get isEnabled() {
        let t = this.ref;
        return t && !t.isDisabled();
      }
      get isHidden() {
        return this.hidden;
      }
      onClick(t, e) {
        e.stopPropagation();
      }
      onCreateSlide(t, e) {
        var i, n, s;
        let a =
            ((s =
              (n =
                (i = this.instance) === null || i === void 0
                  ? void 0
                  : i.carousel) === null || n === void 0
                ? void 0
                : n.slides[e.index]) === null || s === void 0
              ? void 0
              : s.type) || "",
          r = e.el;
        if (r && a) {
          let l = `for-${a}`;
          ["video", "youtube", "vimeo", "html5video"].includes(a) &&
            (l += " for-video"),
            y(r, l);
        }
      }
      onInit() {
        var t;
        let e = this,
          i = e.instance,
          n = i.carousel;
        if (e.ref || !n) return;
        let s = e.option("parentEl") || i.footer || i.container;
        if (!s) return;
        let a = E({}, e.options, {
          parentEl: s,
          classes: { container: "f-thumbs fancybox__thumbs" },
          Carousel: { Sync: { friction: i.option("Carousel.friction") || 0 } },
          on: {
            ready: (r) => {
              let l = r.container;
              l &&
                this.hidden &&
                (e.refresh(),
                (l.style.transition = "none"),
                e.hide(),
                l.offsetHeight,
                queueMicrotask(() => {
                  (l.style.transition = ""), e.show();
                }));
            },
          },
        });
        (a.Carousel = a.Carousel || {}),
          (a.Carousel.on = E(
            ((t = e.options.Carousel) === null || t === void 0
              ? void 0
              : t.on) || {},
            { click: this.onClick, createSlide: this.onCreateSlide },
          )),
          (n.options.Thumbs = a),
          n.attachPlugins({ Thumbs: Ji }),
          (e.ref = n.plugins.Thumbs),
          e.option("showOnStart") ||
            ((e.ref.state = H.Hidden), (e.hidden = !0));
      }
      onResize() {
        var t;
        let e = (t = this.ref) === null || t === void 0 ? void 0 : t.container;
        e && (e.style.maxHeight = "");
      }
      onKeydown(t, e) {
        let i = this.option("key");
        i && i === e && this.toggle();
      }
      toggle() {
        let t = this.ref;
        if (t && !t.isDisabled())
          return t.state === H.Hidden
            ? ((t.state = H.Init), void t.build())
            : void (this.hidden ? this.show() : this.hide());
      }
      show() {
        let t = this.ref;
        if (!t || t.isDisabled()) return;
        let e = t.container;
        e &&
          (this.refresh(),
          e.offsetHeight,
          e.removeAttribute(wi),
          e.classList.remove(Li),
          (this.hidden = !1));
      }
      hide() {
        let t = this.ref,
          e = t && t.container;
        e &&
          (this.refresh(),
          e.offsetHeight,
          e.classList.add(Li),
          e.setAttribute(wi, "true")),
          (this.hidden = !0);
      }
      refresh() {
        let t = this.ref;
        if (!t || !t.state) return;
        let e = t.container,
          i = e?.firstChild || null;
        e &&
          i &&
          i.childNodes.length &&
          (e.style.maxHeight = `${i.getBoundingClientRect().height}px`);
      }
      attach() {
        let t = this,
          e = t.instance;
        e.state === A.Init ? e.on("Carousel.init", t.onInit) : t.onInit(),
          e.on("resize", t.onResize),
          e.on("keydown", t.onKeydown);
      }
      detach() {
        var t;
        let e = this,
          i = e.instance;
        i.off("Carousel.init", e.onInit),
          i.off("resize", e.onResize),
          i.off("keydown", e.onKeydown),
          (t = i.carousel) === null ||
            t === void 0 ||
            t.detachPlugins(["Thumbs"]),
          (e.ref = null);
      }
    };
  Object.defineProperty(Pt, "defaults", {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: ts,
  });
  var Ee = {
      panLeft: {
        icon: '<svg><path d="M5 12h14M5 12l6 6M5 12l6-6"/></svg>',
        change: { panX: -100 },
      },
      panRight: {
        icon: '<svg><path d="M5 12h14M13 18l6-6M13 6l6 6"/></svg>',
        change: { panX: 100 },
      },
      panUp: {
        icon: '<svg><path d="M12 5v14M18 11l-6-6M6 11l6-6"/></svg>',
        change: { panY: -100 },
      },
      panDown: {
        icon: '<svg><path d="M12 5v14M18 13l-6 6M6 13l6 6"/></svg>',
        change: { panY: 100 },
      },
      zoomIn: {
        icon: '<svg><circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.35-4.35M11 8v6M8 11h6"/></svg>',
        action: "zoomIn",
      },
      zoomOut: {
        icon: '<svg><circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.35-4.35M8 11h6"/></svg>',
        action: "zoomOut",
      },
      toggle1to1: {
        icon: '<svg><path d="M3.51 3.07c5.74.02 11.48-.02 17.22.02 1.37.1 2.34 1.64 2.18 3.13 0 4.08.02 8.16 0 12.23-.1 1.54-1.47 2.64-2.79 2.46-5.61-.01-11.24.02-16.86-.01-1.36-.12-2.33-1.65-2.17-3.14 0-4.07-.02-8.16 0-12.23.1-1.36 1.22-2.48 2.42-2.46Z"/><path d="M5.65 8.54h1.49v6.92m8.94-6.92h1.49v6.92M11.5 9.4v.02m0 5.18v0"/></svg>',
        action: "toggleZoom",
      },
      toggleZoom: {
        icon: '<svg><g><line x1="11" y1="8" x2="11" y2="14"></line></g><circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.35-4.35M8 11h6"/></svg>',
        action: "toggleZoom",
      },
      iterateZoom: {
        icon: '<svg><g><line x1="11" y1="8" x2="11" y2="14"></line></g><circle cx="11" cy="11" r="7.5"/><path d="m21 21-4.35-4.35M8 11h6"/></svg>',
        action: "iterateZoom",
      },
      rotateCCW: {
        icon: '<svg><path d="M15 4.55a8 8 0 0 0-6 14.9M9 15v5H4M18.37 7.16v.01M13 19.94v.01M16.84 18.37v.01M19.37 15.1v.01M19.94 11v.01"/></svg>',
        action: "rotateCCW",
      },
      rotateCW: {
        icon: '<svg><path d="M9 4.55a8 8 0 0 1 6 14.9M15 15v5h5M5.63 7.16v.01M4.06 11v.01M4.63 15.1v.01M7.16 18.37v.01M11 19.94v.01"/></svg>',
        action: "rotateCW",
      },
      flipX: {
        icon: '<svg style="stroke-width: 1.3"><path d="M12 3v18M16 7v10h5L16 7M8 7v10H3L8 7"/></svg>',
        action: "flipX",
      },
      flipY: {
        icon: '<svg style="stroke-width: 1.3"><path d="M3 12h18M7 16h10L7 21v-5M7 8h10L7 3v5"/></svg>',
        action: "flipY",
      },
      fitX: {
        icon: '<svg><path d="M4 12V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6M10 18H3M21 18h-7M6 15l-3 3 3 3M18 15l3 3-3 3"/></svg>',
        action: "fitX",
      },
      fitY: {
        icon: '<svg><path d="M12 20H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h6M18 14v7M18 3v7M15 18l3 3 3-3M15 6l3-3 3 3"/></svg>',
        action: "fitY",
      },
      reset: {
        icon: '<svg><path d="M20 11A8.1 8.1 0 0 0 4.5 9M4 5v4h4M4 13a8.1 8.1 0 0 0 15.5 2m.5 4v-4h-4"/></svg>',
        action: "reset",
      },
      toggleFS: {
        icon: '<svg><g><path d="M14.5 9.5 21 3m0 0h-6m6 0v6M3 21l6.5-6.5M3 21v-6m0 6h6"/></g><g><path d="m14 10 7-7m-7 7h6m-6 0V4M3 21l7-7m0 0v6m0-6H4"/></g></svg>',
        action: "toggleFS",
      },
    },
    it;
  (function (o) {
    (o[(o.Init = 0)] = "Init"),
      (o[(o.Ready = 1)] = "Ready"),
      (o[(o.Disabled = 2)] = "Disabled");
  })(it || (it = {}));
  var es = {
      absolute: "auto",
      display: {
        left: ["infobar"],
        middle: [],
        right: ["iterateZoom", "slideshow", "fullscreen", "thumbs", "close"],
      },
      enabled: "auto",
      items: {
        infobar: {
          tpl: '<div class="fancybox__infobar" tabindex="-1"><span data-fancybox-current-index></span>/<span data-fancybox-count></span></div>',
        },
        download: {
          tpl: '<a class="f-button" title="{{DOWNLOAD}}" data-fancybox-download href="javasript:;"><svg><path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2M7 11l5 5 5-5M12 4v12"/></svg></a>',
        },
        prev: {
          tpl: '<button class="f-button" title="{{PREV}}" data-fancybox-prev><svg><path d="m15 6-6 6 6 6"/></svg></button>',
        },
        next: {
          tpl: '<button class="f-button" title="{{NEXT}}" data-fancybox-next><svg><path d="m9 6 6 6-6 6"/></svg></button>',
        },
        slideshow: {
          tpl: '<button class="f-button" title="{{TOGGLE_SLIDESHOW}}" data-fancybox-toggle-slideshow><svg><g><path d="M8 4v16l13 -8z"></path></g><g><path d="M8 4v15M17 4v15"/></g></svg></button>',
        },
        fullscreen: {
          tpl: '<button class="f-button" title="{{TOGGLE_FULLSCREEN}}" data-fancybox-toggle-fullscreen><svg><g><path d="M4 8V6a2 2 0 0 1 2-2h2M4 16v2a2 2 0 0 0 2 2h2M16 4h2a2 2 0 0 1 2 2v2M16 20h2a2 2 0 0 0 2-2v-2"/></g><g><path d="M15 19v-2a2 2 0 0 1 2-2h2M15 5v2a2 2 0 0 0 2 2h2M5 15h2a2 2 0 0 1 2 2v2M5 9h2a2 2 0 0 0 2-2V5"/></g></svg></button>',
        },
        thumbs: {
          tpl: '<button class="f-button" title="{{TOGGLE_THUMBS}}" data-fancybox-toggle-thumbs><svg><circle cx="5.5" cy="5.5" r="1"/><circle cx="12" cy="5.5" r="1"/><circle cx="18.5" cy="5.5" r="1"/><circle cx="5.5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="18.5" cy="12" r="1"/><circle cx="5.5" cy="18.5" r="1"/><circle cx="12" cy="18.5" r="1"/><circle cx="18.5" cy="18.5" r="1"/></svg></button>',
        },
        close: {
          tpl: '<button class="f-button" title="{{CLOSE}}" data-fancybox-close><svg><path d="m19.5 4.5-15 15M4.5 4.5l15 15"/></svg></button>',
        },
      },
      parentEl: null,
    },
    is = {
      tabindex: "-1",
      width: "24",
      height: "24",
      viewBox: "0 0 24 24",
      xmlns: "http://www.w3.org/2000/svg",
    },
    Ai = "has-toolbar",
    Me = "fancybox__toolbar",
    _t = class extends D {
      constructor() {
        super(...arguments),
          Object.defineProperty(this, "state", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: it.Init,
          }),
          Object.defineProperty(this, "container", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: null,
          });
      }
      onReady(t) {
        var e;
        if (!t.carousel) return;
        let i = this.option("display"),
          n = this.option("absolute"),
          s = this.option("enabled");
        if (s === "auto") {
          let c = this.instance.carousel,
            d = 0;
          if (c)
            for (let u of c.slides) (u.panzoom || u.type === "image") && d++;
          d || (s = !1);
        }
        s || (i = void 0);
        let a = 0,
          r = { left: [], middle: [], right: [] };
        if (i)
          for (let c of ["left", "middle", "right"])
            for (let d of i[c]) {
              let u = this.createEl(d);
              u && ((e = r[c]) === null || e === void 0 || e.push(u), a++);
            }
        let l = null;
        if ((a && (l = this.createContainer()), l)) {
          for (let [c, d] of Object.entries(r)) {
            let u = document.createElement("div");
            y(u, Me + "__column is-" + c);
            for (let m of d) u.appendChild(m);
            n !== "auto" || c !== "middle" || d.length || (n = !0),
              l.appendChild(u);
          }
          n === !0 && y(l, "is-absolute"),
            (this.state = it.Ready),
            this.onRefresh();
        } else this.state = it.Disabled;
      }
      onClick(t) {
        var e, i;
        let n = this.instance,
          s = n.getSlide(),
          a = s?.panzoom,
          r = t.target,
          l = r && C(r) ? r.dataset : null;
        if (!l) return;
        if (l.fancyboxToggleThumbs !== void 0)
          return (
            t.preventDefault(),
            t.stopPropagation(),
            void ((e = n.plugins.Thumbs) === null || e === void 0 || e.toggle())
          );
        if (l.fancyboxToggleFullscreen !== void 0)
          return (
            t.preventDefault(),
            t.stopPropagation(),
            void this.instance.toggleFullscreen()
          );
        if (l.fancyboxToggleSlideshow !== void 0) {
          t.preventDefault(), t.stopPropagation();
          let u =
              (i = n.carousel) === null || i === void 0
                ? void 0
                : i.plugins.Autoplay,
            m = u.isActive;
          return (
            a && a.panMode === "mousemove" && !m && a.reset(),
            void (m ? u.stop() : u.start())
          );
        }
        let c = l.panzoomAction,
          d = l.panzoomChange;
        if (((d || c) && (t.preventDefault(), t.stopPropagation()), d)) {
          let u = {};
          try {
            u = JSON.parse(d);
          } catch {}
          a && a.applyChange(u);
        } else c && a && a[c] && a[c]();
      }
      onChange() {
        this.onRefresh();
      }
      onRefresh() {
        if (this.instance.isClosing()) return;
        let t = this.container;
        if (!t) return;
        let e = this.instance.getSlide();
        if (!e || e.state !== Z.Ready) return;
        let i = e && !e.error && e.panzoom;
        for (let a of t.querySelectorAll("[data-panzoom-action]"))
          i
            ? (a.removeAttribute("disabled"), a.removeAttribute("tabindex"))
            : (a.setAttribute("disabled", ""),
              a.setAttribute("tabindex", "-1"));
        let n = i && i.canZoomIn(),
          s = i && i.canZoomOut();
        for (let a of t.querySelectorAll('[data-panzoom-action="zoomIn"]'))
          n
            ? (a.removeAttribute("disabled"), a.removeAttribute("tabindex"))
            : (a.setAttribute("disabled", ""),
              a.setAttribute("tabindex", "-1"));
        for (let a of t.querySelectorAll('[data-panzoom-action="zoomOut"]'))
          s
            ? (a.removeAttribute("disabled"), a.removeAttribute("tabindex"))
            : (a.setAttribute("disabled", ""),
              a.setAttribute("tabindex", "-1"));
        for (let a of t.querySelectorAll(
          '[data-panzoom-action="toggleZoom"],[data-panzoom-action="iterateZoom"]',
        )) {
          s || n
            ? (a.removeAttribute("disabled"), a.removeAttribute("tabindex"))
            : (a.setAttribute("disabled", ""),
              a.setAttribute("tabindex", "-1"));
          let r = a.querySelector("g");
          r && (r.style.display = n ? "" : "none");
        }
      }
      onDone(t, e) {
        var i;
        (i = e.panzoom) === null ||
          i === void 0 ||
          i.on("afterTransform", () => {
            this.instance.isCurrentSlide(e) && this.onRefresh();
          }),
          this.instance.isCurrentSlide(e) && this.onRefresh();
      }
      createContainer() {
        let t = this.instance.container;
        if (!t) return null;
        let e = this.option("parentEl") || t,
          i = e.querySelector("." + Me);
        return (
          i || ((i = document.createElement("div")), y(i, Me), e.prepend(i)),
          i.addEventListener("click", this.onClick, {
            passive: !1,
            capture: !0,
          }),
          t && y(t, Ai),
          (this.container = i),
          i
        );
      }
      createEl(t) {
        let e = this.instance,
          i = e.carousel;
        if (!i || t === "toggleFS" || (t === "fullscreen" && !Vi()))
          return null;
        let n = null,
          s = i.slides.length || 0,
          a = 0,
          r = 0;
        for (let c of i.slides)
          (c.panzoom || c.type === "image") && a++,
            (c.type === "image" || c.downloadSrc) && r++;
        if (s < 2 && ["infobar", "prev", "next"].includes(t)) return n;
        if ((Ee[t] !== void 0 && !a) || (t === "download" && !r)) return null;
        if (t === "thumbs") {
          let c = e.plugins.Thumbs;
          if (!c || !c.isEnabled) return null;
        }
        if (t === "slideshow" && (!i.plugins.Autoplay || s < 2)) return null;
        if (Ee[t] !== void 0) {
          let c = Ee[t];
          (n = document.createElement("button")),
            n.setAttribute(
              "title",
              this.instance.localize(`{{${t.toUpperCase()}}}`),
            ),
            y(n, "f-button"),
            c.action && (n.dataset.panzoomAction = c.action),
            c.change && (n.dataset.panzoomChange = JSON.stringify(c.change)),
            n.appendChild(S(this.instance.localize(c.icon)));
        } else {
          let c = (this.option("items") || [])[t];
          c &&
            ((n = S(this.instance.localize(c.tpl))),
            typeof c.click == "function" &&
              n.addEventListener("click", (d) => {
                d.preventDefault(),
                  d.stopPropagation(),
                  typeof c.click == "function" && c.click.call(this, this, d);
              }));
        }
        let l = n?.querySelector("svg");
        if (l)
          for (let [c, d] of Object.entries(is))
            l.getAttribute(c) || l.setAttribute(c, String(d));
        return n;
      }
      removeContainer() {
        let t = this.container;
        t && t.remove(), (this.container = null), (this.state = it.Disabled);
        let e = this.instance.container;
        e && x(e, Ai);
      }
      attach() {
        let t = this,
          e = t.instance;
        e.on("Carousel.initSlides", t.onReady),
          e.on("done", t.onDone),
          e.on(["reveal", "Carousel.change"], t.onChange),
          t.onReady(t.instance);
      }
      detach() {
        let t = this,
          e = t.instance;
        e.off("Carousel.initSlides", t.onReady),
          e.off("done", t.onDone),
          e.off(["reveal", "Carousel.change"], t.onChange),
          t.removeContainer();
      }
    };
  Object.defineProperty(_t, "defaults", {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: es,
  });
  var ns = {
      Hash: class extends D {
        onReady() {
          ft = !1;
        }
        onChange(o) {
          et && clearTimeout(et);
          let { hash: t } = Ii(),
            { hash: e } = zt(),
            i = o.isOpeningSlide(o.getSlide());
          i && (yi = e === t ? "" : e),
            t &&
              t !== e &&
              (et = setTimeout(() => {
                try {
                  if (o.state === A.Ready) {
                    let n = "replaceState";
                    i && !Yt && ((n = "pushState"), (Yt = !0)),
                      window.history[n](
                        {},
                        document.title,
                        window.location.pathname + window.location.search + t,
                      );
                  }
                } catch {}
              }, 300));
        }
        onClose(o) {
          if ((et && clearTimeout(et), !ft && Yt))
            return (Yt = !1), (ft = !1), void window.history.back();
          if (!ft)
            try {
              window.history.replaceState(
                {},
                document.title,
                window.location.pathname + window.location.search + (yi || ""),
              );
            } catch {}
        }
        attach() {
          let o = this.instance;
          o.on("ready", this.onReady),
            o.on(["Carousel.ready", "Carousel.change"], this.onChange),
            o.on("close", this.onClose);
        }
        detach() {
          let o = this.instance;
          o.off("ready", this.onReady),
            o.off(["Carousel.ready", "Carousel.change"], this.onChange),
            o.off("close", this.onClose);
        }
        static parseURL() {
          return zt();
        }
        static startFromUrl() {
          Si();
        }
        static destroy() {
          window.removeEventListener("hashchange", Ti, !1);
        }
      },
      Html: jt,
      Images: Tt,
      Slideshow: Ht,
      Thumbs: Pt,
      Toolbar: _t,
    },
    Wi = "with-fancybox",
    De = "hide-scrollbar",
    Zi = "--fancybox-scrollbar-compensate",
    Ci = "--fancybox-body-margin",
    Ye = "aria-hidden",
    Oe = "is-using-tab",
    Ne = "is-animated",
    Ei = "is-compact",
    Mi = "is-loading",
    Re = "is-opening",
    Xt = "has-caption",
    at = "disabled",
    $ = "tabindex",
    Di = "download",
    ke = "href",
    rt = "src",
    _ = (o) => typeof o == "string",
    Yi = function () {
      var o = window.getSelection();
      return !!o && o.type === "Range";
    },
    N,
    R = null,
    tt = null,
    Oi = 0,
    Ni = 0,
    Ri = 0,
    ki = 0,
    lt = new Map(),
    ss = 0,
    M = class o extends Qt {
      get isIdle() {
        return this.idle;
      }
      get isCompact() {
        return this.option("compact");
      }
      constructor(t = [], e = {}, i = {}) {
        super(e),
          Object.defineProperty(this, "userSlides", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: [],
          }),
          Object.defineProperty(this, "userPlugins", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: {},
          }),
          Object.defineProperty(this, "idle", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: !1,
          }),
          Object.defineProperty(this, "idleTimer", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: null,
          }),
          Object.defineProperty(this, "clickTimer", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: null,
          }),
          Object.defineProperty(this, "pwt", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: 0,
          }),
          Object.defineProperty(this, "ignoreFocusChange", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: !1,
          }),
          Object.defineProperty(this, "startedFs", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: !1,
          }),
          Object.defineProperty(this, "state", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: A.Init,
          }),
          Object.defineProperty(this, "id", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: 0,
          }),
          Object.defineProperty(this, "container", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: null,
          }),
          Object.defineProperty(this, "caption", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: null,
          }),
          Object.defineProperty(this, "footer", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: null,
          }),
          Object.defineProperty(this, "carousel", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: null,
          }),
          Object.defineProperty(this, "lastFocus", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: null,
          }),
          Object.defineProperty(this, "prevMouseMoveEvent", {
            enumerable: !0,
            configurable: !0,
            writable: !0,
            value: void 0,
          }),
          N || (N = Vi()),
          (this.id = e.id || ++ss),
          lt.set(this.id, this),
          (this.userSlides = t),
          (this.userPlugins = i),
          queueMicrotask(() => {
            this.init();
          });
      }
      init() {
        if (this.state === A.Destroy) return;
        (this.state = A.Init),
          this.attachPlugins(
            Object.assign(Object.assign({}, o.Plugins), this.userPlugins),
          ),
          this.emit("init"),
          this.emit("attachPlugins"),
          this.option("hideScrollbar") === !0 &&
            (() => {
              if (!gt) return;
              let e = document,
                i = e.body,
                n = e.documentElement;
              if (i.classList.contains(De)) return;
              let s = window.innerWidth - n.getBoundingClientRect().width,
                a = parseFloat(window.getComputedStyle(i).marginRight);
              s < 0 && (s = 0),
                n.style.setProperty(Zi, `${s}px`),
                a && i.style.setProperty(Ci, `${a}px`),
                i.classList.add(De);
            })(),
          this.initLayout(),
          this.scale();
        let t = () => {
          this.initCarousel(this.userSlides),
            (this.state = A.Ready),
            this.attachEvents(),
            this.emit("ready"),
            setTimeout(() => {
              this.container && this.container.setAttribute(Ye, "false");
            }, 16);
        };
        this.option("Fullscreen.autoStart") && N && !N.isFullscreen()
          ? N.request()
              .then(() => {
                (this.startedFs = !0), t();
              })
              .catch(() => t())
          : t();
      }
      initLayout() {
        var t, e;
        let i = this.option("parentEl") || document.body,
          n = S(this.localize(this.option("tpl.main") || ""));
        if (n) {
          if (
            (n.setAttribute("id", `fancybox-${this.id}`),
            n.setAttribute("aria-label", this.localize("{{MODAL}}")),
            n.classList.toggle(Ei, this.isCompact),
            y(n, this.option("mainClass") || ""),
            y(n, Re),
            (this.container = n),
            (this.footer = n.querySelector(".fancybox__footer")),
            i.appendChild(n),
            y(document.documentElement, Wi),
            (R && tt) ||
              ((R = document.createElement("span")),
              y(R, "fancybox-focus-guard"),
              R.setAttribute($, "0"),
              R.setAttribute(Ye, "true"),
              R.setAttribute("aria-label", "Focus guard"),
              (tt = R.cloneNode()),
              (t = n.parentElement) === null ||
                t === void 0 ||
                t.insertBefore(R, n),
              (e = n.parentElement) === null || e === void 0 || e.append(tt)),
            n.addEventListener("mousedown", (s) => {
              (Oi = s.pageX), (Ni = s.pageY), x(n, Oe);
            }),
            this.option("closeExisting"))
          )
            for (let s of lt.values()) s.id !== this.id && s.close();
          else
            this.option("animated") &&
              (y(n, Ne),
              setTimeout(() => {
                this.isClosing() || x(n, Ne);
              }, 350));
          this.emit("initLayout");
        }
      }
      initCarousel(t) {
        let e = this.container;
        if (!e) return;
        let i = e.querySelector(".fancybox__carousel");
        if (!i) return;
        let n = (this.carousel = new ct(
          i,
          E(
            {},
            {
              slides: t,
              transition: "fade",
              Panzoom: {
                lockAxis: this.option("dragToClose") ? "xy" : "x",
                infinite: !!this.option("dragToClose") && "y",
              },
              Dots: !1,
              Navigation: {
                classes: {
                  container: "fancybox__nav",
                  button: "f-button",
                  isNext: "is-next",
                  isPrev: "is-prev",
                },
              },
              initialPage: this.option("startIndex"),
              l10n: this.option("l10n"),
            },
            this.option("Carousel") || {},
          ),
        ));
        n.on("*", (s, a, ...r) => {
          this.emit(`Carousel.${a}`, s, ...r);
        }),
          n.on(["ready", "change"], () => {
            this.manageCaption();
          }),
          this.on("Carousel.removeSlide", (s, a, r) => {
            this.clearContent(r), (r.state = void 0);
          }),
          n.on("Panzoom.touchStart", () => {
            var s, a;
            this.isCompact || this.endIdle(),
              !((s = document.activeElement) === null || s === void 0) &&
                s.closest(".f-thumbs") &&
                ((a = this.container) === null || a === void 0 || a.focus());
          }),
          n.on("settle", () => {
            this.idleTimer ||
              this.isCompact ||
              !this.option("idle") ||
              this.setIdle(),
              this.option("autoFocus") && !this.isClosing && this.checkFocus();
          }),
          this.option("dragToClose") &&
            (n.on("Panzoom.afterTransform", (s, a) => {
              let r = this.getSlide();
              if (r && Xe(r.el)) return;
              let l = this.container;
              if (l) {
                let c = Math.abs(a.current.f),
                  d =
                    c < 1
                      ? ""
                      : Math.max(
                          0.5,
                          Math.min(1, 1 - (c / a.contentRect.fitHeight) * 1.5),
                        );
                l.style.setProperty("--fancybox-ts", d ? "0s" : ""),
                  l.style.setProperty("--fancybox-opacity", d + "");
              }
            }),
            n.on("Panzoom.touchEnd", (s, a, r) => {
              var l;
              let c = this.getSlide();
              if (
                (c && Xe(c.el)) ||
                (a.isMobile &&
                  document.activeElement &&
                  ["TEXTAREA", "INPUT"].indexOf(
                    (l = document.activeElement) === null || l === void 0
                      ? void 0
                      : l.nodeName,
                  ) !== -1)
              )
                return;
              let d = Math.abs(a.dragOffset.y);
              a.lockedAxis === "y" &&
                (d >= 200 || (d >= 50 && a.dragOffset.time < 300)) &&
                (r && r.cancelable && r.preventDefault(),
                this.close(
                  r,
                  "f-throwOut" + (a.current.f < 0 ? "Up" : "Down"),
                ));
            })),
          n.on("change", (s) => {
            var a;
            let r =
              (a = this.getSlide()) === null || a === void 0
                ? void 0
                : a.triggerEl;
            if (r) {
              let l = new CustomEvent("slideTo", {
                bubbles: !0,
                cancelable: !0,
                detail: s.page,
              });
              r.dispatchEvent(l);
            }
          }),
          n.on(["refresh", "change"], (s) => {
            let a = this.container;
            if (!a) return;
            for (let c of a.querySelectorAll("[data-fancybox-current-index]"))
              c.innerHTML = s.page + 1;
            for (let c of a.querySelectorAll("[data-fancybox-count]"))
              c.innerHTML = s.pages.length;
            if (!s.isInfinite) {
              for (let c of a.querySelectorAll("[data-fancybox-next]"))
                s.page < s.pages.length - 1
                  ? (c.removeAttribute(at), c.removeAttribute($))
                  : (c.setAttribute(at, ""), c.setAttribute($, "-1"));
              for (let c of a.querySelectorAll("[data-fancybox-prev]"))
                s.page > 0
                  ? (c.removeAttribute(at), c.removeAttribute($))
                  : (c.setAttribute(at, ""), c.setAttribute($, "-1"));
            }
            let r = this.getSlide();
            if (!r) return;
            let l = r.downloadSrc || "";
            l || r.type !== "image" || r.error || !_(r[rt]) || (l = r[rt]);
            for (let c of a.querySelectorAll("[data-fancybox-download]")) {
              let d = r.downloadFilename;
              l
                ? (c.removeAttribute(at),
                  c.removeAttribute($),
                  c.setAttribute(ke, l),
                  c.setAttribute(Di, d || l),
                  c.setAttribute("target", "_blank"))
                : (c.setAttribute(at, ""),
                  c.setAttribute($, "-1"),
                  c.removeAttribute(ke),
                  c.removeAttribute(Di));
            }
          }),
          this.emit("initCarousel");
      }
      attachEvents() {
        let t = this,
          e = t.container;
        if (!e) return;
        e.addEventListener("click", t.onClick, { passive: !1, capture: !1 }),
          e.addEventListener("wheel", t.onWheel, { passive: !1, capture: !1 }),
          document.addEventListener("keydown", t.onKeydown, {
            passive: !1,
            capture: !0,
          }),
          document.addEventListener(
            "visibilitychange",
            t.onVisibilityChange,
            !1,
          ),
          document.addEventListener("mousemove", t.onMousemove),
          t.option("trapFocus") &&
            document.addEventListener("focus", t.onFocus, !0),
          window.addEventListener("resize", t.onResize);
        let i = window.visualViewport;
        i &&
          (i.addEventListener("scroll", t.onResize),
          i.addEventListener("resize", t.onResize));
      }
      detachEvents() {
        let t = this,
          e = t.container;
        if (!e) return;
        document.removeEventListener("keydown", t.onKeydown, {
          passive: !1,
          capture: !0,
        }),
          e.removeEventListener("wheel", t.onWheel, {
            passive: !1,
            capture: !1,
          }),
          e.removeEventListener("click", t.onClick, {
            passive: !1,
            capture: !1,
          }),
          document.removeEventListener("mousemove", t.onMousemove),
          window.removeEventListener("resize", t.onResize);
        let i = window.visualViewport;
        i &&
          (i.removeEventListener("resize", t.onResize),
          i.removeEventListener("scroll", t.onResize)),
          document.removeEventListener(
            "visibilitychange",
            t.onVisibilityChange,
            !1,
          ),
          document.removeEventListener("focus", t.onFocus, !0);
      }
      scale() {
        let t = this.container;
        if (!t) return;
        let e = window.visualViewport,
          i = Math.max(1, e?.scale || 1),
          n = "",
          s = "",
          a = "";
        if (e && i > 1) {
          let r = `${e.offsetLeft}px`,
            l = `${e.offsetTop}px`;
          (n = e.width * i + "px"),
            (s = e.height * i + "px"),
            (a = `translate3d(${r}, ${l}, 0) scale(${1 / i})`);
        }
        (t.style.transform = a), (t.style.width = n), (t.style.height = s);
      }
      onClick(t) {
        var e;
        let { container: i, isCompact: n } = this;
        if (!i || this.isClosing()) return;
        !n && this.option("idle") && this.resetIdle();
        let s = t.composedPath()[0];
        if (
          s.closest(".fancybox-spinner") ||
          s.closest("[data-fancybox-close]")
        )
          return t.preventDefault(), void this.close(t);
        if (s.closest("[data-fancybox-prev]"))
          return t.preventDefault(), void this.prev();
        if (s.closest("[data-fancybox-next]"))
          return t.preventDefault(), void this.next();
        if (
          (t.type === "click" && t.detail === 0) ||
          Math.abs(t.pageX - Oi) > 30 ||
          Math.abs(t.pageY - Ni) > 30
        )
          return;
        let a = document.activeElement;
        if (Yi() && a && i.contains(a)) return;
        if (
          n &&
          ((e = this.getSlide()) === null || e === void 0 ? void 0 : e.type) ===
            "image"
        )
          return void (this.clickTimer
            ? (clearTimeout(this.clickTimer), (this.clickTimer = null))
            : (this.clickTimer = setTimeout(() => {
                this.toggleIdle(), (this.clickTimer = null);
              }, 350)));
        if ((this.emit("click", t), t.defaultPrevented)) return;
        let r = !1;
        if (s.closest(".fancybox__content")) {
          if (a) {
            if (a.closest("[contenteditable]")) return;
            s.matches(We) || a.blur();
          }
          if (Yi()) return;
          r = this.option("contentClick");
        } else
          s.closest(".fancybox__carousel") &&
            !s.matches(We) &&
            (r = this.option("backdropClick"));
        r === "close"
          ? (t.preventDefault(), this.close(t))
          : r === "next"
            ? (t.preventDefault(), this.next())
            : r === "prev" && (t.preventDefault(), this.prev());
      }
      onWheel(t) {
        let e = t.target,
          i = this.option("wheel", t);
        e.closest(".fancybox__thumbs") && (i = "slide");
        let n = i === "slide",
          s = [-t.deltaX || 0, -t.deltaY || 0, -t.detail || 0].reduce(
            function (l, c) {
              return Math.abs(c) > Math.abs(l) ? c : l;
            },
          ),
          a = Math.max(-1, Math.min(1, s)),
          r = Date.now();
        this.pwt && r - this.pwt < 300
          ? n && t.preventDefault()
          : ((this.pwt = r),
            this.emit("wheel", t, a),
            t.defaultPrevented ||
              (i === "close"
                ? (t.preventDefault(), this.close(t))
                : i === "slide" &&
                  (Gt(e) ||
                    (t.preventDefault(), this[a > 0 ? "prev" : "next"]()))));
      }
      onScroll() {
        window.scrollTo(Ri, ki);
      }
      onKeydown(t) {
        if (!this.isTopmost()) return;
        this.isCompact ||
          !this.option("idle") ||
          this.isClosing() ||
          this.resetIdle();
        let e = t.key,
          i = this.option("keyboard");
        if (!i) return;
        let n = t.composedPath()[0],
          s = document.activeElement && document.activeElement.classList,
          a =
            (s && s.contains("f-button")) ||
            n.dataset.carouselPage ||
            n.dataset.carouselIndex;
        if (
          (e !== "Escape" &&
            !a &&
            C(n) &&
            (n.isContentEditable ||
              ["TEXTAREA", "OPTION", "INPUT", "SELECT", "VIDEO"].indexOf(
                n.nodeName,
              ) !== -1)) ||
          (t.key === "Tab" ? y(this.container, Oe) : x(this.container, Oe),
          t.ctrlKey || t.altKey || t.shiftKey)
        )
          return;
        this.emit("keydown", e, t);
        let r = i[e];
        r && typeof this[r] == "function" && (t.preventDefault(), this[r]());
      }
      onResize() {
        let t = this.container;
        if (!t) return;
        let e = this.isCompact;
        t.classList.toggle(Ei, e),
          this.manageCaption(this.getSlide()),
          this.isCompact ? this.clearIdle() : this.endIdle(),
          this.scale(),
          this.emit("resize");
      }
      onFocus(t) {
        this.isTopmost() && this.checkFocus(t);
      }
      onMousemove(t) {
        (this.prevMouseMoveEvent = t),
          !this.isCompact && this.option("idle") && this.resetIdle();
      }
      onVisibilityChange() {
        document.visibilityState === "visible"
          ? this.checkFocus()
          : this.endIdle();
      }
      manageCloseBtn(t) {
        let e = this.optionFor(t, "closeButton") || !1;
        if (e === "auto") {
          let n = this.plugins.Toolbar;
          if (n && n.state === it.Ready) return;
        }
        if (!e || !t.contentEl || t.closeBtnEl) return;
        let i = this.option("tpl.closeButton");
        if (i) {
          let n = S(this.localize(i));
          (t.closeBtnEl = t.contentEl.appendChild(n)),
            t.el && y(t.el, "has-close-btn");
        }
      }
      manageCaption(t = void 0) {
        var e, i;
        let n = "fancybox__caption",
          s = this.container;
        if (!s) return;
        x(s, Xt);
        let a = this.isCompact || this.option("commonCaption"),
          r = !a;
        if (
          (this.caption && this.stop(this.caption),
          r && this.caption && (this.caption.remove(), (this.caption = null)),
          a && !this.caption)
        )
          for (let u of ((e = this.carousel) === null || e === void 0
            ? void 0
            : e.slides) || [])
            u.captionEl &&
              (u.captionEl.remove(),
              (u.captionEl = void 0),
              x(u.el, Xt),
              (i = u.el) === null ||
                i === void 0 ||
                i.removeAttribute("aria-labelledby"));
        if ((t || (t = this.getSlide()), !t || (a && !this.isCurrentSlide(t))))
          return;
        let l = t.el,
          c = this.optionFor(t, "caption", "");
        if (!c)
          return void (
            a &&
            this.caption &&
            this.animate(this.caption, "f-fadeOut", () => {
              this.caption && (this.caption.innerHTML = "");
            })
          );
        let d = null;
        if (r) {
          if (((d = t.captionEl || null), l && !d)) {
            let u = n + `_${this.id}_${t.index}`;
            (d = document.createElement("div")),
              y(d, n),
              d.setAttribute("id", u),
              (t.captionEl = l.appendChild(d)),
              y(l, Xt),
              l.setAttribute("aria-labelledby", u);
          }
        } else
          (d = this.caption),
            d || (d = s.querySelector("." + n)),
            !d &&
              ((d = document.createElement("div")),
              (d.dataset.fancyboxCaption = ""),
              y(d, n),
              (this.footer || s).prepend(d)),
            y(s, Xt),
            (this.caption = d);
        d &&
          ((d.innerHTML = ""),
          _(c) || typeof c == "number"
            ? (d.innerHTML = c + "")
            : c instanceof HTMLElement && d.appendChild(c));
      }
      checkFocus(t) {
        this.focus(t);
      }
      focus(t) {
        var e;
        if (this.ignoreFocusChange) return;
        let i = document.activeElement || null,
          n = t?.target || null,
          s = this.container,
          a =
            (e = this.carousel) === null || e === void 0 ? void 0 : e.viewport;
        if (!s || !a || (!t && i && s.contains(i))) return;
        let r = this.getSlide(),
          l = r && r.state === Z.Ready ? r.el : null;
        if (!l || l.contains(i) || s === i) return;
        t && t.cancelable && t.preventDefault(), (this.ignoreFocusChange = !0);
        let c = Array.from(s.querySelectorAll(We)),
          d = [],
          u = null;
        for (let h of c) {
          let b = !h.offsetParent || !!h.closest('[aria-hidden="true"]'),
            p = l && l.contains(h),
            f = !a.contains(h);
          if (h === s || ((p || f) && !b)) {
            d.push(h);
            let g = h.dataset.origTabindex;
            g !== void 0 && g && (h.tabIndex = parseFloat(g)),
              h.removeAttribute("data-orig-tabindex"),
              (!h.hasAttribute("autoFocus") && u) || (u = h);
          } else {
            let g =
              h.dataset.origTabindex === void 0
                ? h.getAttribute("tabindex") || ""
                : h.dataset.origTabindex;
            g && (h.dataset.origTabindex = g), (h.tabIndex = -1);
          }
        }
        let m = null;
        t
          ? (!n || d.indexOf(n) < 0) &&
            ((m = u || s),
            d.length &&
              (i === tt
                ? (m = d[0])
                : (this.lastFocus !== s && i !== R) || (m = d[d.length - 1])))
          : (m = r && r.type === "image" ? s : u || s),
          m && Fi(m),
          (this.lastFocus = document.activeElement),
          (this.ignoreFocusChange = !1);
      }
      next() {
        let t = this.carousel;
        t && t.pages.length > 1 && t.slideNext();
      }
      prev() {
        let t = this.carousel;
        t && t.pages.length > 1 && t.slidePrev();
      }
      jumpTo(...t) {
        this.carousel && this.carousel.slideTo(...t);
      }
      isTopmost() {
        var t;
        return (
          ((t = o.getInstance()) === null || t === void 0 ? void 0 : t.id) ==
          this.id
        );
      }
      animate(t = null, e = "", i) {
        if (!t || !e) return void (i && i());
        this.stop(t);
        let n = (s) => {
          s.target === t &&
            t.dataset.animationName &&
            (t.removeEventListener("animationend", n),
            delete t.dataset.animationName,
            i && i(),
            x(t, e));
        };
        (t.dataset.animationName = e),
          t.addEventListener("animationend", n),
          y(t, e);
      }
      stop(t) {
        t &&
          t.dispatchEvent(
            new CustomEvent("animationend", {
              bubbles: !1,
              cancelable: !0,
              currentTarget: t,
            }),
          );
      }
      setContent(t, e = "", i = !0) {
        if (this.isClosing()) return;
        let n = t.el;
        if (!n) return;
        let s = null;
        if (
          (C(e)
            ? (s = e)
            : ((s = S(e + "")),
              C(s) ||
                ((s = document.createElement("div")), (s.innerHTML = e + ""))),
          ["img", "picture", "iframe", "video", "audio"].includes(
            s.nodeName.toLowerCase(),
          ))
        ) {
          let a = document.createElement("div");
          a.appendChild(s), (s = a);
        }
        C(s) && t.filter && !t.error && (s = s.querySelector(t.filter)),
          s && C(s)
            ? (y(s, "fancybox__content"),
              t.id && s.setAttribute("id", t.id),
              n.classList.add(`has-${t.error ? "error" : t.type || "unknown"}`),
              n.prepend(s),
              s.style.display === "none" && (s.style.display = ""),
              getComputedStyle(s).getPropertyValue("display") === "none" &&
                (s.style.display =
                  t.display || this.option("defaultDisplay") || "flex"),
              (t.contentEl = s),
              i && this.revealContent(t),
              this.manageCloseBtn(t),
              this.manageCaption(t))
            : this.setError(t, "{{ELEMENT_NOT_FOUND}}");
      }
      revealContent(t, e) {
        let i = t.el,
          n = t.contentEl;
        i &&
          n &&
          (this.emit("reveal", t),
          this.hideLoading(t),
          (t.state = Z.Opening),
          (e = this.isOpeningSlide(t)
            ? e === void 0
              ? this.optionFor(t, "showClass")
              : e
            : "f-fadeIn")
            ? this.animate(n, e, () => {
                this.done(t);
              })
            : this.done(t));
      }
      done(t) {
        this.isClosing() ||
          ((t.state = Z.Ready),
          this.emit("done", t),
          y(t.el, "is-done"),
          this.isCurrentSlide(t) &&
            this.option("autoFocus") &&
            queueMicrotask(() => {
              var e;
              (e = t.panzoom) === null || e === void 0 || e.updateControls(),
                this.option("autoFocus") && this.focus();
            }),
          this.isOpeningSlide(t) &&
            (x(this.container, Re),
            !this.isCompact && this.option("idle") && this.setIdle()));
      }
      isCurrentSlide(t) {
        let e = this.getSlide();
        return !(!t || !e) && e.index === t.index;
      }
      isOpeningSlide(t) {
        var e, i;
        return (
          ((e = this.carousel) === null || e === void 0
            ? void 0
            : e.prevPage) === null &&
          t &&
          t.index ===
            ((i = this.getSlide()) === null || i === void 0 ? void 0 : i.index)
        );
      }
      showLoading(t) {
        t.state = Z.Loading;
        let e = t.el;
        e &&
          (y(e, Mi),
          this.emit("loading", t),
          t.spinnerEl ||
            setTimeout(() => {
              if (!this.isClosing() && !t.spinnerEl && t.state === Z.Loading) {
                let i = S(ze);
                y(i, "fancybox-spinner"),
                  (t.spinnerEl = i),
                  e.prepend(i),
                  this.animate(i, "f-fadeIn");
              }
            }, 250));
      }
      hideLoading(t) {
        let e = t.el;
        if (!e) return;
        let i = t.spinnerEl;
        this.isClosing()
          ? i?.remove()
          : (x(e, Mi),
            i &&
              this.animate(i, "f-fadeOut", () => {
                i.remove();
              }),
            t.state === Z.Loading &&
              (this.emit("loaded", t), (t.state = Z.Ready)));
      }
      setError(t, e) {
        if (this.isClosing()) return;
        let i = new Event("error", { bubbles: !0, cancelable: !0 });
        if ((this.emit("error", i, t), i.defaultPrevented)) return;
        (t.error = e), this.hideLoading(t), this.clearContent(t);
        let n = document.createElement("div");
        n.classList.add("fancybox-error"),
          (n.innerHTML = this.localize(e || "<p>{{ERROR}}</p>")),
          this.setContent(t, n);
      }
      clearContent(t) {
        if (t.state === void 0) return;
        this.emit("clearContent", t),
          t.contentEl && (t.contentEl.remove(), (t.contentEl = void 0));
        let e = t.el;
        e &&
          (x(e, "has-error"),
          x(e, "has-unknown"),
          x(e, `has-${t.type || "unknown"}`)),
          t.closeBtnEl && t.closeBtnEl.remove(),
          (t.closeBtnEl = void 0),
          t.captionEl && t.captionEl.remove(),
          (t.captionEl = void 0),
          t.spinnerEl && t.spinnerEl.remove(),
          (t.spinnerEl = void 0);
      }
      getSlide() {
        var t;
        let e = this.carousel;
        return (
          ((t = e?.pages[e?.page]) === null || t === void 0
            ? void 0
            : t.slides[0]) || void 0
        );
      }
      close(t, e) {
        if (this.isClosing()) return;
        let i = new Event("shouldClose", { bubbles: !0, cancelable: !0 });
        if ((this.emit("shouldClose", i, t), i.defaultPrevented)) return;
        t && t.cancelable && (t.preventDefault(), t.stopPropagation());
        let n = () => {
          this.proceedClose(t, e);
        };
        this.startedFs && N && N.isFullscreen()
          ? Promise.resolve(N.exit()).then(() => n())
          : n();
      }
      clearIdle() {
        this.idleTimer && clearTimeout(this.idleTimer), (this.idleTimer = null);
      }
      setIdle(t = !1) {
        let e = () => {
          this.clearIdle(),
            (this.idle = !0),
            y(this.container, "is-idle"),
            this.emit("setIdle");
        };
        if ((this.clearIdle(), !this.isClosing()))
          if (t) e();
          else {
            let i = this.option("idle");
            i && (this.idleTimer = setTimeout(e, i));
          }
      }
      endIdle() {
        this.clearIdle(),
          this.idle &&
            !this.isClosing() &&
            ((this.idle = !1),
            x(this.container, "is-idle"),
            this.emit("endIdle"));
      }
      resetIdle() {
        this.endIdle(), this.setIdle();
      }
      toggleIdle() {
        this.idle ? this.endIdle() : this.setIdle(!0);
      }
      toggleFullscreen() {
        N &&
          (N.isFullscreen()
            ? N.exit()
            : N.request().then(() => {
                this.startedFs = !0;
              }));
      }
      isClosing() {
        return [A.Closing, A.CustomClosing, A.Destroy].includes(this.state);
      }
      proceedClose(t, e) {
        var i, n;
        (this.state = A.Closing), this.clearIdle(), this.detachEvents();
        let s = this.container,
          a = this.carousel,
          r = this.getSlide(),
          l =
            r && this.option("placeFocusBack")
              ? r.triggerEl || this.option("triggerEl")
              : null;
        if (
          (l && (Gi(l) ? Fi(l) : l.focus()),
          s &&
            (x(s, Re),
            y(s, "is-closing"),
            s.setAttribute(Ye, "true"),
            this.option("animated") && y(s, Ne),
            (s.style.pointerEvents = "none")),
          a)
        ) {
          a.clearTransitions(),
            (i = a.panzoom) === null || i === void 0 || i.destroy(),
            (n = a.plugins.Navigation) === null || n === void 0 || n.detach();
          for (let c of a.slides) {
            (c.state = Z.Closing), this.hideLoading(c);
            let d = c.contentEl;
            d && this.stop(d);
            let u = c?.panzoom;
            u && (u.stop(), u.detachEvents(), u.detachObserver()),
              this.isCurrentSlide(c) || a.emit("removeSlide", c);
          }
        }
        (Ri = window.scrollX),
          (ki = window.scrollY),
          window.addEventListener("scroll", this.onScroll),
          this.emit("close", t),
          this.state !== A.CustomClosing
            ? (e === void 0 && r && (e = this.optionFor(r, "hideClass")),
              e && r
                ? (this.animate(r.contentEl, e, () => {
                    a && a.emit("removeSlide", r);
                  }),
                  setTimeout(() => {
                    this.destroy();
                  }, 500))
                : this.destroy())
            : setTimeout(() => {
                this.destroy();
              }, 500);
      }
      destroy() {
        var t;
        if (this.state === A.Destroy) return;
        window.removeEventListener("scroll", this.onScroll),
          (this.state = A.Destroy),
          (t = this.carousel) === null || t === void 0 || t.destroy();
        let e = this.container;
        e && e.remove(), lt.delete(this.id);
        let i = o.getInstance();
        i
          ? i.focus()
          : (R && (R.remove(), (R = null)),
            tt && (tt.remove(), (tt = null)),
            x(document.documentElement, Wi),
            (() => {
              if (!gt) return;
              let n = document,
                s = n.body;
              s.classList.remove(De),
                s.style.setProperty(Ci, ""),
                n.documentElement.style.setProperty(Zi, "");
            })(),
            this.emit("destroy"));
      }
      static bind(t, e, i) {
        if (!gt) return;
        let n,
          s = "",
          a = {};
        if (
          (t === void 0
            ? (n = document.body)
            : _(t)
              ? ((n = document.body),
                (s = t),
                typeof e == "object" && (a = e || {}))
              : ((n = t),
                _(e) && (s = e),
                typeof i == "object" && (a = i || {})),
          !n || !C(n))
        )
          return;
        s = s || "[data-fancybox]";
        let r = o.openers.get(n) || new Map();
        r.set(s, a),
          o.openers.set(n, r),
          r.size === 1 && n.addEventListener("click", o.fromEvent);
      }
      static unbind(t, e) {
        let i,
          n = "";
        if (
          (_(t) ? ((i = document.body), (n = t)) : ((i = t), _(e) && (n = e)),
          !i)
        )
          return;
        let s = o.openers.get(i);
        s && n && s.delete(n),
          (n && s) ||
            (o.openers.delete(i), i.removeEventListener("click", o.fromEvent));
      }
      static destroy() {
        let t;
        for (; (t = o.getInstance()); ) t.destroy();
        for (let e of o.openers.keys())
          e.removeEventListener("click", o.fromEvent);
        o.openers = new Map();
      }
      static fromEvent(t) {
        if (
          t.defaultPrevented ||
          (t.button && t.button !== 0) ||
          t.ctrlKey ||
          t.metaKey ||
          t.shiftKey
        )
          return;
        let e = t.composedPath()[0],
          i = e.closest("[data-fancybox-trigger]");
        if (i) {
          let b = i.dataset.fancyboxTrigger || "",
            p = document.querySelectorAll(`[data-fancybox="${b}"]`),
            f = parseInt(i.dataset.fancyboxIndex || "", 10) || 0;
          e = p[f] || e;
        }
        if (!(e && e instanceof Element)) return;
        let n, s, a, r;
        if (
          ([...o.openers].reverse().find(
            ([b, p]) =>
              !(
                !b.contains(e) ||
                ![...p].reverse().find(([f, g]) => {
                  let F = e.closest(f);
                  return !!F && ((n = b), (s = f), (a = F), (r = g), !0);
                })
              ),
          ),
          !n || !s || !a)
        )
          return;
        (r = r || {}), t.preventDefault(), (e = a);
        let l = [],
          c = E({}, Ie, r);
        (c.event = t), (c.triggerEl = e), (c.delegate = i);
        let d = c.groupAll,
          u = c.groupAttr,
          m = u && e ? e.getAttribute(`${u}`) : "";
        if (
          ((!e || m || d) && (l = [].slice.call(n.querySelectorAll(s))),
          e &&
            !d &&
            (l = m ? l.filter((b) => b.getAttribute(`${u}`) === m) : [e]),
          !l.length)
        )
          return;
        let h = o.getInstance();
        return h && h.options.triggerEl && l.indexOf(h.options.triggerEl) > -1
          ? void 0
          : (e && (c.startIndex = l.indexOf(e)), o.fromNodes(l, c));
      }
      static fromSelector(t, e, i) {
        let n = null,
          s = "",
          a = {};
        if (
          (_(t)
            ? ((n = document.body),
              (s = t),
              typeof e == "object" && (a = e || {}))
            : t instanceof HTMLElement &&
              _(e) &&
              ((n = t), (s = e), typeof i == "object" && (a = i || {})),
          !n || !s)
        )
          return !1;
        let r = o.openers.get(n);
        return (
          !!r &&
          ((a = E({}, r.get(s) || {}, a)),
          !!a && o.fromNodes(Array.from(n.querySelectorAll(s)), a))
        );
      }
      static fromNodes(t, e) {
        e = E({}, Ie, e || {});
        let i = [];
        for (let n of t) {
          let s = n.dataset || {},
            a =
              s[rt] ||
              n.getAttribute(ke) ||
              n.getAttribute("currentSrc") ||
              n.getAttribute(rt) ||
              void 0,
            r,
            l = e.delegate,
            c;
          l &&
            i.length === e.startIndex &&
            (r =
              l instanceof HTMLImageElement
                ? l
                : l.querySelector("img:not([aria-hidden])")),
            r ||
              (r =
                n instanceof HTMLImageElement
                  ? n
                  : n.querySelector("img:not([aria-hidden])")),
            r &&
              ((c = r.currentSrc || r[rt] || void 0),
              !c &&
                r.dataset &&
                (c = r.dataset.lazySrc || r.dataset[rt] || void 0));
          let d = {
            src: a,
            triggerEl: n,
            thumbEl: r,
            thumbElSrc: c,
            thumbSrc: c,
          };
          for (let u in s) {
            let m = s[u] + "";
            (m = m !== "false" && (m === "true" || m)), (d[u] = m);
          }
          i.push(d);
        }
        return new o(i, e);
      }
      static getInstance(t) {
        return t
          ? lt.get(t)
          : Array.from(lt.values())
              .reverse()
              .find((e) => !e.isClosing() && e) || null;
      }
      static getSlide() {
        var t;
        return (
          ((t = o.getInstance()) === null || t === void 0
            ? void 0
            : t.getSlide()) || null
        );
      }
      static show(t = [], e = {}) {
        return new o(t, e);
      }
      static next() {
        let t = o.getInstance();
        t && t.next();
      }
      static prev() {
        let t = o.getInstance();
        t && t.prev();
      }
      static close(t = !0, ...e) {
        if (t) for (let i of lt.values()) i.close(...e);
        else {
          let i = o.getInstance();
          i && i.close(...e);
        }
      }
    };
  Object.defineProperty(M, "version", {
    enumerable: !0,
    configurable: !0,
    writable: !0,
    value: "5.0.36",
  }),
    Object.defineProperty(M, "defaults", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: Ie,
    }),
    Object.defineProperty(M, "Plugins", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: ns,
    }),
    Object.defineProperty(M, "openers", {
      enumerable: !0,
      configurable: !0,
      writable: !0,
      value: new Map(),
    });
  var Kt = class extends V {
    submit(o) {
      o.preventDefault(), this.fieldTarget.classList.remove("animate-error");
      let t = o.target.code.value;
      if (
        ((t = t.toLowerCase()),
        (t = t.replace(/[^a-z0-9?]/gi, "")),
        document.getElementById(t))
      )
        this.fancyContent(t);
      else if (t.length < 2) this.flashError();
      else {
        this.fieldTarget.setAttribute("readonly", !0),
          this.buttonTarget.setAttribute("disabled", !0),
          window.hasOwnProperty("plausible") &&
            window.plausible("Submit", { props: { code: t } });
        let i = new FormData();
        i.append("code", t),
          fetch("https://mystery.thisisnotawebsitedotcom.com/", {
            method: "POST",
            body: i,
          }).then(async (n) => {
            if (!n.ok) this.flashError();
            else {
              let s = n.headers.get("content-type"),
                a = document.createElement("div");
              a.setAttribute("id", t),
                a.classList.add("hidden", "html"),
                (a.innerHTML = await n.text()),
                document.body.appendChild(a),
                this.fancyContent(t);
            }
            this.fieldTarget.removeAttribute("readonly"),
              this.buttonTarget.removeAttribute("disabled");
          });
      }
    }
    flashError() {
      this.fieldTarget.offsetHeight,
        this.fieldTarget.classList.add("animate-error");
    }
    fancyContent(o) {
      new M([{ src: `#${o}`, type: "inline" }], {
        backdropClick: !1,
        Toolbar: { display: { left: [], middle: [], right: ["close"] } },
      });
    }
    expandImage(o) {
      new M([{ src: o.target.src }], {
        backdropClick: "toggleZoom",
        Toolbar: { display: { left: [], middle: [], right: ["close"] } },
      });
    }
    randomizeError() {
      if (this.hasBubbleTarget) {
        let o = [
            "Oops, the Mystery Shack is currently experiencing some delays dude! Please bare with us as we figure out which wire goes where!",
            "Lets see... the blue wire is connected to the....hip bone....",
            "So what I wanna know is, why are cryptic riddles always written down on tattered yellowed parchment. Get some normal paper dude!",
            "Still comin, dudes! In the meantime, please <a href='https://files.thisisnotawebsitedotcom.com/is-it-time-yet/the-great-gatsby.pdf' target='_blank'>enjoy this fine literature</a> while you wait. People are saying its the book of the summer!",
            "In the meantime, experience some <a href='https://www.youtube.com/watch?v=qQJorCFgEHg' target='_blank'>soothing tunes</a> while you wait. They drown out the rage, dude!",
            "I tried to explain to Mr Pines how to open a PDF one time. He got so angry and confused that he punched through my Funko shelf! Many brave Funkos were lost that day...",
            "My favorite Otter Pop is Sir Isaac Lime. But Louie Bloo is pretty cool too. Which is your favorite Otter Pop? Sound off in chat!",
            "If the ICEE bear was real, I wonder if he would be my friend...",
            "Hopefully nobody was expecting anything too crazy , heh heh!",
            "Hey dude, did you know that computers are filled with ghouls? That\u2019s a fact.",
            "I\u2019M gonna watch YOU. You\u2019re the website now, dude!",
            "To quote a great man, \u201Ceverythings gonna be alright...rockabye\u201D",
            "I wonder if its possible to taste your own tongue. Im gonna get to the bottom of this,dude!",
            "Boy that counter is MESSED UP. I guess we\u2019ll be ready when it finally reaches the bottom of....math?",
            "Man, I tried to look at that Bill Book and it was just a bunch of static and the words \u201CHE\u2019S UNCORRUPTABLE.\u201D Whats that mean? Beats me, dawg!",
            "Are you Blanchin? Girl we blanchin! I live up in a- dang, still in my head!",
            "If I can\u2019t get this fixed, this WILL be the Final Countdown, dudes!",
            "Ugh man did you see the new <u>Swordbirth: Rise of the Swordians: Age of Swords</u> DLC just got delayed AGAIN? Don\u2019t they understand, as a consumer, my time is valuable!?<br/>...<br/>I wonder if I could make a hat small enough to fit on a bird.",
            "<img src='data:image/png;base64,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' style='width: 100%' />",
          ],
          t = Math.floor(Math.random() * o.length);
        o[t].includes("data:image") &&
          (t = Math.floor(Math.random() * o.length)),
          (this.bubbleTarget.innerHTML = o[t]),
          o[t].includes("data:image") && this.hasLayerTarget
            ? this.layerTarget.classList.remove("hidden")
            : this.layerTarget.classList.add("hidden");
      }
    }
  };
  Ft(Kt, "targets", ["button", "field", "bubble", "layer"]);
  var os = {
      "./controllers/countdown_controller.js": Be,
      "./controllers/secrets_controller.js": Te,
    },
    Hi = os;
  window.Stimulus = Lt.start();
  Object.entries(Hi).forEach(([o, t]) => {
    if (o.includes("_controller.") || o.includes("-controller.")) {
      let e = o
        .replace("./controllers/", "")
        .replace(/[_-]controller\..*$/, "")
        .replace(/_/g, "-")
        .replace(/\//g, "--");
      Stimulus.register(e, t.default);
    }
  });
})();
//# sourceMappingURL=/_bridgetown/static/index.M723IYP7.js.map
