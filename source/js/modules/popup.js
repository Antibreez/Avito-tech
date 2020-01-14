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
