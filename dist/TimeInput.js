function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

import React, { Component } from 'react';

import isTwelveHourTime from './lib/is-twelve-hour-time';
import replaceCharAt from './lib/replace-char-at';
import getGroupId from './lib/get-group-id';
import getGroups from './lib/get-groups';
import adder from './lib/time-string-adder';
import caret from './lib/caret';
import validate from './lib/validate';

var SILHOUETTE = '00:00:00:000 AM';

// isSeparator :: Char -> Bool
var isSeparator = function isSeparator(char) {
  return (/[:\s]/.test(char)
  );
};

var TimeInput = function (_Component) {
  _inherits(TimeInput, _Component);

  function TimeInput(props) {
    _classCallCheck(this, TimeInput);

    var _this = _possibleConstructorReturn(this, _Component.call(this, props));

    _this.state = {};

    _this.format = _this.format.bind(_this);
    _this.handleBlur = _this.handleBlur.bind(_this);
    _this.handleEscape = _this.handleEscape.bind(_this);
    _this.handleTab = _this.handleTab.bind(_this);
    _this.handleArrows = _this.handleArrows.bind(_this);
    _this.silhouette = _this.silhouette.bind(_this);
    _this.handleBackspace = _this.handleBackspace.bind(_this);
    _this.handleForwardSpace = _this.handleForwardSpace.bind(_this);
    _this.handleKeyDown = _this.handleKeyDown.bind(_this);
    _this.handleChange = _this.handleChange.bind(_this);
    _this.onChange = _this.onChange.bind(_this);
    return _this;
  }

  TimeInput.prototype.render = function render() {
    var _this2 = this;

    var className = 'TimeInput';
    if (this.props.className) {
      className += ' ' + this.props.className;
    }
    return React.createElement('input', {
      className: className + ' TimeInput-input',
      ref: function ref(input) {
        _this2.input = input;
      },
      type: 'text',
      value: this.format(this.props.value),
      onChange: this.handleChange,
      onBlur: this.handleBlur,
      onKeyDown: this.handleKeyDown
    });
  };

  TimeInput.prototype.format = function format(val) {
    if (isTwelveHourTime(val)) val = val.replace(/^00/, '12');
    return val.toUpperCase();
  };

  TimeInput.prototype.componentDidMount = function componentDidMount() {
    this.mounted = true;
  };

  TimeInput.prototype.componentWillUnmount = function componentWillUnmount() {
    this.mounted = false;
  };

  TimeInput.prototype.componentDidUpdate = function componentDidUpdate() {
    var index = this.state.caretIndex;
    if (index || index === 0) caret.set(this.input, index);
  };

  TimeInput.prototype.handleBlur = function handleBlur() {
    if (this.mounted) this.setState({ caretIndex: null });
  };

  TimeInput.prototype.handleEscape = function handleEscape() {
    if (this.mounted) this.input.blur();
  };

  TimeInput.prototype.handleTab = function handleTab(event) {
    var start = caret.start(this.input);
    var value = this.props.value;
    var groups = getGroups(value);
    var groupId = getGroupId(start);
    if (event.shiftKey) {
      if (!groupId) return;
      groupId--;
    } else {
      if (groupId >= groups.length - 1) return;
      groupId++;
    }
    event.preventDefault();
    var index = groupId * 3;
    if (this.props.value.charAt(index) === ' ') index++;
    if (this.mounted) this.setState({ caretIndex: index });
  };

  TimeInput.prototype.handleArrows = function handleArrows(event) {
    event.preventDefault();
    var start = caret.start(this.input);
    var value = this.props.value;
    var amount = event.which === 38 ? 1 : -1;
    if (event.shiftKey) {
      amount *= 2;
      if (event.metaKey) amount *= 2;
    }
    value = adder(value, getGroupId(start), amount);
    this.onChange(value, start);
  };

  TimeInput.prototype.silhouette = function silhouette() {
    return this.props.value.replace(/\d/g, function (val, i) {
      return SILHOUETTE.charAt(i);
    });
  };

  TimeInput.prototype.handleBackspace = function handleBackspace(event) {
    event.preventDefault();
    var start = caret.start(this.input);
    var value = this.props.value;
    var end = caret.end(this.input);
    if (!start && !end) return;
    var diff = end - start;
    var silhouette = this.silhouette();
    if (!diff) {
      if (value[start - 1] === ':') start--;
      value = replaceCharAt(value, start - 1, silhouette.charAt(start - 1));
      start--;
    } else {
      while (diff--) {
        if (value[end - 1] !== ':') {
          value = replaceCharAt(value, end - 1, silhouette.charAt(end - 1));
        }
        end--;
      }
    }
    if (value.charAt(start - 1) === ':') start--;
    this.onChange(value, start);
  };

  TimeInput.prototype.handleForwardSpace = function handleForwardSpace(event) {
    event.preventDefault();
    var start = caret.start(this.input);
    var value = this.props.value;
    var end = caret.end(this.input);
    if (start === end === value.length - 1) return;
    var diff = end - start;
    var silhouette = this.silhouette();
    if (!diff) {
      if (value[start] === ':') start++;
      value = replaceCharAt(value, start, silhouette.charAt(start));
      start++;
    } else {
      while (diff--) {
        if (value[end - 1] !== ':') {
          value = replaceCharAt(value, start, silhouette.charAt(start));
        }
        start++;
      }
    }
    if (value.charAt(start) === ':') start++;
    this.onChange(value, start);
  };

  TimeInput.prototype.handleKeyDown = function handleKeyDown(event) {
    switch (event.which) {
      case 9:
        // Tab
        return this.handleTab(event);
      case 8:
        // Backspace
        return this.handleBackspace(event);
      case 46:
        // Forward
        return this.handleForwardSpace(event);
      case 27:
        // Esc
        return this.handleEscape(event);
      case 38: // Left
      case 40:
        // Right
        return this.handleArrows(event);
      default:
        break;
    }
  };

  TimeInput.prototype.handleChange = function handleChange(event) {
    var value = this.props.value;
    var newValue = this.input.value;
    var diff = newValue.length - value.length;
    var end = caret.start(this.input);
    var insertion = void 0;
    var start = end - Math.abs(diff);
    event.preventDefault();
    if (diff > 0) {
      insertion = newValue.slice(end - diff, end);
      while (diff--) {
        var oldChar = value.charAt(start);
        var newChar = insertion.charAt(0);
        if (isSeparator(oldChar)) {
          if (isSeparator(newChar)) {
            insertion = insertion.slice(1);
            start++;
          } else {
            start++;
            diff++;
            end++;
          }
        } else {
          value = replaceCharAt(value, start, newChar);
          insertion = insertion.slice(1);
          start++;
        }
      }
      newValue = value;
    } else {
      if (newValue.charAt(start) === ':') start++;
      // apply default to selection
      var result = value;
      for (var i = start; i < end; i++) {
        result = replaceCharAt(result, i, newValue.charAt(i));
      }
      newValue = result;
    }
    if (validate(newValue)) {
      if (newValue.charAt(end) === ':') end++;
      this.onChange(newValue, end);
    } else {
      var caretIndex = this.props.value.length - (newValue.length - end);
      if (this.mounted) this.setState({ caretIndex: caretIndex });
    }
  };

  TimeInput.prototype.onChange = function onChange(str, caretIndex) {
    if (this.props.onChange) this.props.onChange(this.format(str));
    if (this.mounted && typeof caretIndex === 'number') this.setState({ caretIndex: caretIndex });
  };

  return TimeInput;
}(Component);

export default TimeInput;