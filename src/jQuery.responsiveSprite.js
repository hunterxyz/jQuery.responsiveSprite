(function ($) {

    var tools =
    {
        setPosition: function (num) {
            var self = this;
            self.find(".sprite").css("left", num + "px");
        },
        sendWarning: function () {
            console.warn("To use this method the sprite must be in STOP or PAUSE state");
        }
    };

    var methods =
    {
        init: function (options) {

            return this.each(function () {

                var self = $(this);
                var data = self.data('responsiveSprite');
                // If the plugin hasn't been initialized yet
                if (!data) {
                    if (!options.fps || !options.frames) {
                        $.error("Options fps and frames are required");
                    }
                    var settings = $.extend(
                        {
                            debug: false
                        }, options);

                    $(this).data('responsiveSprite',
                        {
                            playTimes:       0,
                            settings:        settings,
                            currentPosition: 0,
                            currentFrame:    1,
                            running:         false
                        });

                    data = self.data('responsiveSprite');

                    self.find(".sprite").css("width", settings.frames * self.width() + "px");


                    data.resizeId = Math.random();
                    $(window).on("resize.responsiveSprite." + data.resizeId, function () {
                        var data = self.data('responsiveSprite');

                        var myW = self.width();

                        self.find(".sprite").css("width", settings.frames * myW + "px");
                        tools.setPosition.call(self, -((data.currentFrame - 1) * myW));
                    });
                }
            });
        },

        play: function (times) {
            var self = this;
            var data = self.data('responsiveSprite');
            if (data.running) {
                if (data.direction == "forward") {
                    return;
                }
                else {
                    methods.pause.call(self);
                }
            }

            if (!times) {
                data.times = 0;
            }
            else {
                data.times = times;
            }

            if (data.currentFrame == data.settings.frames) {
                data.playTimes--;
            }

            data.running = true;
            data.direction = "forward";

            data.interval = setInterval(function () {
                //calcolo della larghezza del blocco
                var myWidth = self.width();

                var data = self.data('responsiveSprite');

                //next frame
                data.currentFrame++;

                var lastFramePx = (data.settings.frames - 1) * myWidth;
                //next left value
                data.currentPosition = myWidth * (data.currentFrame - 1);

                //se currentPosition supera l'ultimo frame l'animazione riparte da 1

                if (data.currentPosition > lastFramePx) {
                    if (data.times) {
                        //ed incrementa la variabile di conteggio del numero
                        //di iterazioni effettuate solo se times non è uguale a 0 o undefined
                        data.playTimes++;
                    }
                    data.currentPosition = 0;
                    data.currentFrame = 1;
                }
                //se times è settato e il numero di iterazioni è stato soddisfatto da times
                if (data.times != 0 && data.playTimes == times) {
                    //stop animation
                    methods.pause.call(self);
                    data.currentFrame = data.settings.frames;
                    data.currentPosition = lastFramePx;
                    self.trigger("playTimesReached.responsiveSprite");
                }
                else {
                    //updating left value
                    tools.setPosition.call(self, -data.currentPosition);

                    if (data.debug) {
                        console.log("Current frame = ", data.currentFrame, "Current left value", data.currentPosition);
                    }
                }
            }, 1000 / data.settings.fps);
        },

        pause: function () {
            var self = this;
            var data = self.data('responsiveSprite');

            clearInterval(data.interval);


            data.running = false;
            data.playTimes = 0;
            data.times = 0;
        },

        stop: function () {
            var self = this;
            var data = self.data('responsiveSprite');

            clearInterval(data.interval);
            tools.setPosition.call(self, 0);
            data.running = false;
            //reset dei parametri
            data.currentFrame = 1;
            data.currentPosition = 0;
            data.playTimes = 0;
            data.times = 0;
        },

        rewind: function (times) {
            var self = this;
            var data = self.data('responsiveSprite');
            if (data.running) {
                if (data.direction == "backward") {
                    return;
                }
                else {
                    methods.pause.call(self);
                }
            }

            if (!times) {
                data.times = 0;
            }
            else {
                data.times = times;
            }

            if (data.currentFrame == 1) {
                data.playTimes--;
            }

            data.running = true;
            data.direction = "backward";

            data.interval = setInterval(function () {
                //calcolo della larghezza del blocco
                var myWidth = self.width();
                var data = self.data('responsiveSprite');

                //frame precedente
                data.currentFrame--;

                //calcolo dell'ultimo frame
                var lastFramePx = (data.settings.frames - 1) * myWidth;
                //prossimo valore di left
                data.currentPosition = myWidth * (data.currentFrame - 1);

                if (data.currentPosition < 0) {
                    if (data.times) {
                        //ed incrementa la variabile di conteggio del numero
                        //di iterazioni effettuate solo se times non ? uguale a 0 o undefined
                        data.playTimes++;
                    }
                    data.currentPosition = lastFramePx;
                    data.currentFrame = data.settings.frames;
                    self.trigger("rewindTimesReached.responsiveSprite");
                }
                //se times ? settato e il numero di iterazioni ? stato soddisfatto da times
                if (data.times != 0 && data.playTimes == times) {
                    //pausa dell'animazione
                    methods.pause.call(self);
                    data.currentPosition = 0;
                    data.currentFrame = 1;
                }
                else {
                    //aggiornamento del valore di left
                    tools.setPosition.call(self, -data.currentPosition);

                    if (data.debug) {
                        console.log("Current frame = ", data.currentFrame, "Current left value", data.currentPosition);
                    }

                    //decremento del frame
                    //data.currentFrame--;
                }
            }, 1000 / data.settings.fps);
        },


        goToFrame: function (number) {
            var self = this;
            var data = self.data('responsiveSprite');

            if (data.running) {
                tools.sendWarning();
                return;
            }

            if (!isNaN(number) || number.match(/%$/)) {
                var selectedFrame = 1;
                if (!isNaN(number)) {
                    //valori da 1 a n dove n è il numero dei frame totali
                    selectedFrame = (number % data.settings.frames) || data.settings.frames;
                }
                else {
                    //calcolo percentuale
                    selectedFrame = (data.settings.frames * parseInt(number)) / 100;
                    //se selected frame risulta 0 viene settato a 1 che ? il primo frame
                    selectedFrame = parseInt(selectedFrame) || 1;
                }
                var newPosition = (selectedFrame - 1) * self.width();
                //console.log(selectedFrame,newPosition);
                tools.setPosition.call(self, -newPosition);
                data.currentFrame = selectedFrame;
            }
            else {
                console.error("goToFrame needs a numeric or percentage parameter");
            }
        },

        next: function () {
            var self = this;
            var data = self.data('responsiveSprite');

            if (data.running) {
                tools.sendWarning();
                return;
            }

            data.currentFrame++;
            if (data.currentFrame === data.settings.frames + 1) {


                data.currentFrame = 1;
            }
            var newPosition = (data.currentFrame - 1) * self.width();
            tools.setPosition.call(self, -newPosition);
        },

        prev: function () {
            var self = this;
            var data = self.data('responsiveSprite');

            if (data.running) {
                tools.sendWarning();
                return;
            }

            data.currentFrame--;
            if (data.currentFrame === 0) {
                data.currentFrame = data.settings.frames;
            }
            var newPosition = (data.currentFrame - 1) * self.width();
            tools.setPosition.call(self, -newPosition);
        },

        destroy: function () {
            return this.each(function () {
                var self = $(this);
                var data = self.data('responsiveSprite');

                methods.stop.call(self);

                var sprite = self.find(".sprite");
                sprite.css("left", "");
                sprite.css("width", "");
                // Namespacing FTW
                $(window).off("resize.responsiveSprite." + data.resizeId);
                self.removeData('responsiveSprite');
            });
        },

        setFps: function (fps) {
            var self = this;
            var data = self.data("responsiveSprite");

            if (!isNaN(fps)) {
                if (fps <= 0) {


                    $.error("fps must be major of ZERO");
                }
                else {
                    data.settings.fps = fps;
                }
            }
            else {
                $.error("fps must be a numeric parameter");
            }
        }
    };

    $.fn.responsiveSprite = function (method) {
        if (methods[method]) {
            var data = this.data("responsiveSprite");
            if (!data) {
                $.error("responsiveSlide must be initialized");
            }
            return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
        }
        else if (typeof method === 'object' || !method) {
            return methods.init.apply(this, arguments);
        }
        else {
            $.error('Method ' + method + ' does not exist on jQuery.responsiveSprite');
        }
    };

})(jQuery);