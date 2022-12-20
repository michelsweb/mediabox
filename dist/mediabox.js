/*!
 * mediabox
 * v1.1.3 |
 * (c) 2022 Pedro Rogerio |
 * https://github.com/pinceladasdaweb/mediabox
 */
class MediaBox {
  constructor(element, params = 0) {
    const default_params = { autoplay: '1' };

    if (!this || !(this instanceof MediaBox)) {
      return new MediaBox(element, params);
    }

    if (!element) {
      return false;
    }

    this.params = Object.assign(default_params, params);
    this.selector = element instanceof NodeList ? [...element] : [...document.querySelectorAll(element)];
    this.root = document.querySelector('body');
    this.run();
  }

  run() {
    Array.prototype.forEach.call(this.selector, el => {
      el.addEventListener('click', e => {
        e.preventDefault();

        const link = this.parseUrl(el.getAttribute('href'));
        this.render(link);
        this.events();
      }, false);
    });

    this.root.addEventListener('keyup', e => {
      if ((e.keyCode || e.which) === 27) {
        this.close(this.root.querySelector('.mediabox-wrap'));
      }
    }, false);
  }

  template(template, config) {
    let key;

    for (key in config) {
      if (config.hasOwnProperty(key)) {
        template = template.replace(new RegExp(`{${key}}`, 'g'), config[key]);
      }
    }
    return template;
  }

  parseUrl(url) {
    const service = {};
    let matches;

    if (matches = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=)([^#\&\?]*).*/)) {
      service.provider = "youtube";
      service.id = matches[2];
    } else if (matches = url.match(/https?:\/\/(?:www\.)?vimeo.com\/(?:channels\/|groups\/([^\/]*)\/videos\/|album\/(\d+)\/video\/|)(\d+)(?:$|\/|\?)/)) {
      service.provider = "vimeo";
      service.id = matches[3];
    } else {
      service.provider = "Unknown";
      service.id = '';
    }

    return service;
  }

  render(service) {
    let embedLink;
    let lightbox;
    let urlParams;

    if (service.provider === 'youtube') {
      embedLink = `https://www.youtube.com/embed/${service.id}`;
    } else if (service.provider === 'vimeo') {
      embedLink = `https://player.vimeo.com/video/${service.id}`;
    } else {
      throw new Error("Invalid video URL");
    }

    urlParams = this.serialize(this.params);

    lightbox = this.template(
      '<div class="mediabox-wrap" role="dialog" aria-hidden="false"><div class="mediabox-content" role="document" tabindex="0"><span id="mediabox-esc" class="mediabox-close" aria-label="close" tabindex="1"></span><iframe src="{embed}{params}" frameborder="0" allowfullscreen></iframe></div></div>', {
        embed: embedLink,
        params: urlParams
      });

    this.lastFocusElement = document.activeElement;
    this.root.insertAdjacentHTML('beforeend', lightbox);
    document.body.classList.add('stop-scroll');
  }

  events() {
    const wrapper = document.querySelector('.mediabox-wrap');
    const content = document.querySelector('.mediabox-content');

    wrapper.addEventListener('click', event => {
      if (event.target && event.target.nodeName === 'SPAN' && event.target.className === 'mediabox-close' || event.target.nodeName === 'DIV' && event.target.className === 'mediabox-wrap' || (event.target.className === 'mediabox-content' && event.target.nodeName !== 'IFRAME')) {
        this.close(wrapper);
      }
    }, false);

    document.addEventListener('focus', event => {
      if (content && !content.contains(event.target)) {
        event.stopPropagation();
        content.focus();
      }
    }, true);

    content.addEventListener('keypress', event => {
      if (event.keyCode === 13) {
        this.close(wrapper);
      }
    }, false);
  }

  close(element) {
    if (element === null) {
      return true;
    }
    let timer = null;

    if (timer) {
      clearTimeout(timer);
    }

    element.classList.add('mediabox-hide');

    timer = setTimeout(() => {
      const elm = document.querySelector('.mediabox-wrap');
      if (elm !== null) {
        document.body.classList.remove('stop-scroll');
        this.root.removeChild(elm);
        this.lastFocusElement.focus();
      }
    }, 500);
  }

  serialize(obj) {
    return `?${Object.keys(obj).reduce((a, k) => {
      a.push(`${k}=${encodeURIComponent(obj[k])}`);
      return a
    }, []).join('&')}`;
  }
}

export default MediaBox
