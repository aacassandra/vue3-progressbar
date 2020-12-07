import { reactive, nextTick } from 'vue';
import View from './vue3-progressbar.vue';

// eslint-disable-next-line no-unused-vars
function assign(target, source) {
  for (var index = 1, key, src; index < arguments.length; ++index) {
    src = arguments[index];

    for (key in src) {
      if (Object.prototype.hasOwnProperty.call(src, key)) {
        target[key] = src[key];
      }
    }
  }

  return target;
}

export default {
  install: (app, options) => {
    const DEFAULT_OPTION = {
      canSuccess: true,
      show: false,
      color: '#73ccec',
      position: 'fixed',
      failedColor: 'red',
      thickness: '2px',
      transition: {
        speed: '0.2s',
        opacity: '0.6s',
        termination: 300
      },
      autoRevert: true,
      location: 'top',
      inverse: false,
      autoFinish: true
    };
    const progressOptions = assign(DEFAULT_OPTION, options);

    const RADON_LOADING_BAR = reactive({
      percent: 0,
      options: progressOptions
    });

    app.provide('RADON_LOADING_BAR', RADON_LOADING_BAR);

    let Progress = {
      state: {
        tFailColor: '',
        tColor: '',
        timer: null,
        cut: 0
      },
      start(time) {
        if (!time) time = 3000;
        RADON_LOADING_BAR.percent = 0; // RADON_LOADING_BAR.percent
        RADON_LOADING_BAR.options.show = true;
        RADON_LOADING_BAR.options.canSuccess = true;
        this.state.cut = 10000 / Math.floor(time);
        clearInterval(this.state.timer);
        this.state.timer = setInterval(() => {
          this.increase(this.state.cut * Math.random());
          if (RADON_LOADING_BAR.percent > 95 && RADON_LOADING_BAR.options.autoFinish) {
            this.finish();
          }
        }, 100);
      },
      set(num) {
        RADON_LOADING_BAR.options.show = true;
        RADON_LOADING_BAR.options.canSuccess = true;
        RADON_LOADING_BAR.percent = Math.floor(num);
      },
      get() {
        return Math.floor(RADON_LOADING_BAR.percent);
      },
      increase(num) {
        RADON_LOADING_BAR.percent = Math.min(99, RADON_LOADING_BAR.percent + Math.floor(num));
      },
      decrease(num) {
        RADON_LOADING_BAR.percent = RADON_LOADING_BAR.percent - Math.floor(num);
      },
      hide() {
        clearInterval(this.state.timer);
        this.state.timer = null;
        setTimeout(() => {
          RADON_LOADING_BAR.options.show = false;
          nextTick(() => {
            setTimeout(() => {
              RADON_LOADING_BAR.percent = 0;
            }, 100);
            if (RADON_LOADING_BAR.options.autoRevert) {
              setTimeout(() => {
                this.revert();
              }, 300);
            }
          });
        }, RADON_LOADING_BAR.options.transition.termination);
      },
      pause() {
        clearInterval(this.state.timer);
      },
      finish() {
        RADON_LOADING_BAR.percent = 100;
        this.hide();
      },
      fail() {
        RADON_LOADING_BAR.options.canSuccess = false;
        RADON_LOADING_BAR.percent = 100;
        this.hide();
      },
      setFailColor(color) {
        RADON_LOADING_BAR.options.failedColor = color;
      },
      setColor(color) {
        RADON_LOADING_BAR.options.color = color;
      },
      setLocation(loc) {
        RADON_LOADING_BAR.options.location = loc;
      },
      setTransition(transition) {
        RADON_LOADING_BAR.options.transition = transition;
      },
      tempFailColor(color) {
        this.state.tFailColor = RADON_LOADING_BAR.options.failedColor;
        RADON_LOADING_BAR.options.failedColor = color;
      },
      tempColor(color) {
        this.state.tColor = RADON_LOADING_BAR.options.color;
        RADON_LOADING_BAR.options.color = color;
      },
      tempLocation(loc) {
        this.state.tLocation = RADON_LOADING_BAR.options.location;
        RADON_LOADING_BAR.options.location = loc;
      },
      tempTransition(transition) {
        this.state.tTransition = RADON_LOADING_BAR.options.transition;
        RADON_LOADING_BAR.options.transition = transition;
      },
      revertColor() {
        RADON_LOADING_BAR.options.color = this.state.tColor;
        this.state.tColor = '';
      },
      revertFailColor() {
        RADON_LOADING_BAR.options.failedColor = this.state.tFailColor;
        this.state.tFailColor = '';
      },
      revertLocation() {
        RADON_LOADING_BAR.options.location = this.state.tLocation;
        this.state.tLocation = '';
      },
      revertTransition() {
        RADON_LOADING_BAR.options.transition = this.state.tTransition;
        this.state.tTransition = {};
      },
      revert() {
        if (RADON_LOADING_BAR.options.autoRevert) {
          if (this.state.tColor) {
            this.revertColor();
          }
          if (this.state.tFailColor) {
            this.revertFailColor();
          }
          if (this.state.tLocation) {
            this.revertLocation();
          }
          if (
            this.state.tTransition &&
            (this.state.tTransition.speed !== undefined ||
              this.state.tTransition.opacity !== undefined)
          ) {
            this.revertTransition();
          }
        }
      },
      parseMeta(meta) {
        for (var x in meta.func) {
          let func = meta.func[x];
          switch (func.call) {
            case 'color':
              switch (func.modifier) {
                case 'set':
                  this.setColor(func.argument);
                  break;
                case 'temp':
                  this.tempColor(func.argument);
                  break;
              }
              break;
            case 'fail':
              switch (func.modifier) {
                case 'set':
                  this.setFailColor(func.argument);
                  break;
                case 'temp':
                  this.tempFailColor(func.argument);
                  break;
              }
              break;
            case 'location':
              switch (func.modifier) {
                case 'set':
                  this.setLocation(func.argument);
                  break;
                case 'temp':
                  this.tempLocation(func.argument);
                  break;
              }
              break;
            case 'transition':
              switch (func.modifier) {
                case 'set':
                  this.setTransition(func.argument);
                  break;
                case 'temp':
                  this.tempTransition(func.argument);
                  break;
              }
              break;
          }
        }
      }
    };

    app.component('vue-progress-bar', View);
    app.config.globalProperties.$Progress = Progress;
  }
};
