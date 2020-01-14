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
