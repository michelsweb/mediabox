class MediaBox {
  /**
   * @param element
   * @param params
   * @returns {MediaBox|boolean}
   */
  constructor(element, params = {}) {
    const default_params = { autoplay: '1' };
    this.params = { ...default_params, ...params }
    this.selector = element instanceof NodeList ? [...element] : [...document.querySelectorAll(element)];
    this.root = document.querySelector('body');
    this.run();
  }

  run() {
    this.selector.forEach(element => {
      element.addEventListener('click', event => {
        event.preventDefault();

        const link = this.parseUrl(element.getAttribute('href'));
        this.render(link);
        this.events();
      }, false);
    });

    this.root.addEventListener('keyup', event => {
      if ((event.keyCode || event.which) === 27) {
        this.close(this.root.querySelector('.mediabox-wrap'));
      }
    }, false);
  }

  /**
   * @param template
   * @param config
   * @returns {*}
   */
  template(template, config) {
    let key;

    for (key in config) {
      if (config.hasOwnProperty(key)) {
        template = template.replace(new RegExp(`{${key}}`, 'g'), config[key]);
      }
    }
    return template;
  }

  /**
   * @param url
   * @returns {{}}
   */
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
      if (
        event.target && event.target.nodeName === 'SPAN' &&
        event.target.className === 'mediabox-close' ||
        event.target.nodeName === 'DIV' &&
        event.target.className === 'mediabox-wrap' ||
        (event.target.className === 'mediabox-content' &&
        event.target.nodeName !== 'IFRAME')
      ) {
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
    return `?${Object.keys(obj).reduce((params, key) => {
      params.push(`${key}=${encodeURIComponent(obj[key])}`);
      return params;
    }, []).join('&')}`;
  }
}

export default MediaBox
