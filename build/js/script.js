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

'use strict';

(function () {
  var ReqUrl = {
    get: function (id) {
      return id ? 'https://boiling-refuge-66454.herokuapp.com/images/' + id
        : 'https://boiling-refuge-66454.herokuapp.com/images';
    }
  };

  // var getReqUrl = function (id) {
  //   return id ? 'http://134.209.138.34/item/' + id : 'http://134.209.138.34/items';
  // };

  var ReqMethod = {
    GET: 'GET',
  };

  var ReqStatus = {
    OK: 200,
    MULTIPLE_CHOICES: 300,
  };

  var TIMEOUT = 10000;

  var isErrorStatus = function (xhr) {
    return xhr.status < ReqStatus.OK
      || xhr.status > ReqStatus.MULTIPLE_CHOICES;
  };

  var createRequest = function (onLoad, onError) {
    var xhr = new XMLHttpRequest();

    xhr.timeout = TIMEOUT;
    xhr.responseType = 'json';

    xhr.addEventListener('load', function () {
      if (isErrorStatus(xhr)) {
        onError('Данные не загрузились. Причина: ' + xhr.status + ' ' + xhr.statusText);
        return;
      }

      onLoad(xhr.response);
    });

    xhr.addEventListener('error', function () {
      onError('Произошла ошибка соединения');
    });

    xhr.addEventListener('timeout', function () {
      onError('Запрос не успел выполниться за ' + xhr.timeout + 'мс');
    });

    return xhr;
  };

  var removeElement = function (element) {
    element.remove();
  };

  var onAnyError = function (message) {
    var node = document.createElement('div');
    node.style = 'z-index: 100; margin: 0 auto; text-align: center; background-color: red;';
    node.style.position = 'absolute';
    node.style.left = 0;
    node.style.right = 0;
    node.style.fontSize = '30px';

    node.textContent = message;
    document.body.insertAdjacentElement('afterbegin', node);
    window.setTimeout(removeElement, 2000, node);
  };

  window.backend = {
    load: function (id, onLoad, onError) {
      var req = createRequest(onLoad, onError || onAnyError);
      req.open(ReqMethod.GET, ReqUrl.get(id));
      req.send();
    }
  };
})();

'use strict';

(function (
    backend,
    makeFragmentRender
) {
  var body = document.querySelector('body');
  var popup = document.querySelector('.popup');
  var overlay = document.querySelector('.popup__overlay');
  var picture = document.querySelector('.popup__picture');
  var comments = document.querySelector('.popup__comments');
  var close = document.querySelector('.popup__close');
  var form = document.querySelector('.popup__form');
  var nameInput = form.querySelector("input[name='name']");
  var commentInput = form.querySelector("input[name='comment']");
  var commentTemplate = document.querySelector('#comment').content.querySelector('.comment');

  var getCorrectNumber = function (num) {
    return Math.floor(num / 10) > 0 ? num : '0' + num;
  };

  var getDate = function (date) {
    var date = new Date(date);

    var day = date.getDay();
    var month = date.getMonth() + 1;
    var year = date.getFullYear();

    return getCorrectNumber(day) + '.' + getCorrectNumber(month) + '.' + year;
  };

  var renderComment = function (comment) {
    var node = commentTemplate.cloneNode(true);
    node.querySelector('.comment__date').textContent = getDate(comment.date);
    node.querySelector('.comment__message').textContent = comment.text;

    return node;
  };

  var getCommentsFragment = makeFragmentRender(renderComment);

  var onDataLoad = function (data) {
    picture.src = data.url;

    var commentsData = data.comments;

    comments.appendChild(getCommentsFragment(commentsData))
  };

  var removeComment = function (comment) {
    comments.removeChild(comment);
  };

  var Popup = function () {
    this.data = {};
    this.id = 0;
    this._close = this._close.bind(this);
    this._onKeyDown = this._onKeyDown.bind(this);
    this._onSubmit = this._onSubmit.bind(this);
  };

  Popup.prototype.show = function (id) {
    this.id = id;
    backend.load(id, onDataLoad);
    body.classList.add('popup');
    window.DomUtil.show(popup);
    this._addEventListeners();
  };

  Popup.prototype._clear = function () {
    comments.querySelectorAll('.comment').forEach(removeComment);
    picture.src = '';
    nameInput.value = '';
    commentInput.value = '';
  };

  Popup.prototype._close = function () {
    body.classList.remove('popup');
    window.DomUtil.hide(popup);
    this._clear();
    this._removeEventListeners();
  };

  Popup.prototype._onKeyDown = function (evt) {
    if (evt.key === 'Esc' || evt.key === 'Escape') {
      this._close();
    }
  };

  Popup.prototype._onSubmit = function (evt) {
    evt.preventDefault();

    form.action = 'https://boiling-refuge-66454.herokuapp.com/images/' + this.id + '/comments';
    form.submit();
    this._close();
  };

  Popup.prototype._addEventListeners = function () {
    close.addEventListener('click', this._close);
    overlay.addEventListener('click', this._close);
    document.addEventListener('keydown', this._onKeyDown);
    form.addEventListener('submit', this._onSubmit);
  };

  Popup.prototype._removeEventListeners = function () {
    close.removeEventListener('click', this._close);
    overlay.removeEventListener('click', this._close);
    document.removeEventListener('keydown', this._onKeyDown);
    form.removeEventListener('submit', this._onSubmit);
  };

  window.Popup = Popup;
})(
    window.backend,
    window.DomUtil.makeFragmentRender
);

'use strict';

(function (
    backend,
    makeFragmentRender,
    Popup
){
  var gallery = document.querySelector('.gallery');
  var pictureTemplate = document.querySelector('#picture').content.querySelector('.picture-box');

  var popup = new Popup();

  var renderPicture = function (picture) {
    var node = pictureTemplate.cloneNode(true);
    var img = node.querySelector('.picture');
    img.src = picture.url;
    img.dataset.id = picture.id;

    return node;
  };

  var getGalleryFragment = makeFragmentRender(renderPicture);

  var setGallery = function (pictures) {
    gallery.appendChild(getGalleryFragment(pictures));
  };

  var onGalleryClick = function (evt) {
    var target = evt.target.classList.contains('picture') ? evt.target
      : evt.target.classList.contains('picture-box') ? evt.target.querySelector('picture')
      : null;

    if (target) {
      popup.show(target.dataset.id);
    }
  }

  backend.load(null, setGallery);
  gallery.addEventListener('click', onGalleryClick);
})(
    window.backend,
    window.DomUtil.makeFragmentRender,
    window.Popup
);
