'use strict';

(function () {
  var forEach = Array.prototype.forEach;

  var clearInput = function (input) {
    input.value = '';
  };

  window.DomUtil = {
    isHidden: function (element) {
      return element.classList.contains('hidden');
    },

    show: function (element) {
      element.classList.remove('hidden');
    },

    hide: function (element) {
      element.classList.add('hidden');
    },

    clear: function () {
      forEach.call(arguments, clearInput);
    },

    makeFragmentRender: function (render) {
      return function (dataList) {
        var fragment = document.createDocumentFragment();
        dataList.forEach(function (data, idx) {
          fragment.appendChild(render(data, idx));
        });

        return fragment;
      };
    }
  };
})();
