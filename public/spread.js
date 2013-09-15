/******** library extension ********/
Array.prototype.shuffle = function() {
    var i = this.length;
    while(i){
        var j = Math.floor(Math.random()*i);
        var t = this[--i];
        this[i] = this[j];
        this[j] = t;
    }
    return this;
};

ko.observableArray.fn.shuffle = function () {
    this.valueWillMutate();
    this().shuffle();
    this.valueHasMutated();
};

//http://stackoverflow.com/questions/7264899/detect-css-transitions-using-javascript-and-without-modernizr
var supportsCssTransitions = (function () {
    var b = document.body || document.documentElement;
    var s = b.style;
    var p = 'transition';
    if(typeof s[p] == 'string') {return true; }

    // Tests for vendor specific prop
    var v = ['Moz', 'Webkit', 'Khtml', 'O', 'ms'];
    var p2 = p.charAt(0).toUpperCase() + p.substr(1);
    for(var i=0; i<v.length; i++) {
      if(typeof s[v[i] + p2] == 'string') { return true; }
    }
    return false;
} ());

var supportsCssAnimation = (function () {
    var b = document.body || document.documentElement;
    var s = b.style;
    if (typeof s["webkitAnimation"] == 'string') {
        return true;
    } else if (s["Animation"] == 'string') {
        return true;
    } else {
        return false;
    }
} ()); //TODO: right logic


var config = {
    spread: ko.observable({})
};

(function ($, ko) {

/******** resources ********/
var cardData =  [{
    nameEn: "The Fool",
    nameJa: "愚者",
    descId: 'tooltip-desc-the-fool'
}, {
    nameEn: "The Magician",
    nameJa: "魔術師",
    descId: 'tooltip-desc-the-magician'
}, {
    nameEn: "The High Priestess",
    nameJa: "女教皇",
    descId: 'tooltip-desc-the-high-priestess'
}, {
    nameEn: "The Empress",
    nameJa: "女帝",
    descId: 'tooltip-desc-the-empress'
}, {
    nameEn: "The Emperor",
    nameJa: "皇帝",
    descId: 'tooltip-desc-the-emperor'
}, {
    nameEn: "The Hierophant",
    nameJa: "教皇",
    descId: 'tooltip-desc-the-hierophant'
}, {
    nameEn: "The Lovers",
    nameJa: "恋人達",
    descId: 'tooltip-desc-the-lovers'
}, {
    nameEn: "The Chariot",
    nameJa: "戦車",
    descId: 'tooltip-desc-the-chariot'
}, {
    nameEn: "Justice",
    nameJa: "正義",
    descId: 'tooltip-desc-justice'
}, {
    nameEn: "The Hermit",
    nameJa: "隠者",
    descId: 'tooltip-desc-the-hermit'
}, {
    nameEn: "The Wheel of Fortune",
    nameJa: "運命の輪",
    descId: 'tooltip-desc-the-wheel-of-fortune'
}, {
    nameEn: "Strength",
    nameJa: "力",
    descId: 'tooltip-desc-strength'
}, {
    nameEn: "The Hanged Man",
    nameJa: "吊された男",
    descId: 'tooltip-desc-the-hanged-man'
}, {
    nameEn: "Death",
    nameJa: "死神",
    descId: 'tooltip-desc-death'
}, {
    nameEn: "Temperance",
    nameJa: "節制",
    descId: 'tooltip-desc-temperance'
}, {
    nameEn: "The Devil",
    nameJa: "悪魔",
    descId: 'tooltip-desc-devil'
}, {
    nameEn: "The Tower",
    nameJa: "塔",
    descId: 'tooltip-desc-the-tower'
}, {
    nameEn: "The Star",
    nameJa: "星",
    descId: 'tooltip-desc-the-start'
}, {
    nameEn: "The Moon",
    nameJa: "月",
    descId: 'tooltip-desc-moon'
}, {
    nameEn: "The Sun",
    nameJa: "太陽",
    descId: 'tooltip-desc-the-sun'
}, {
    nameEn: "Judgement",
    nameJa: "審判",
    descId: 'tooltip-desc-judgement'
}, {
    nameEn: "The World",
    nameJa: "世界",
    descId: 'tooltip-desc-the-world'
}];


var CardViewModel = function (data) {
    this.nameJa = data.nameJa;
    this.nameEn= data.nameEn;
    this.reversed = ko.observable(data.reversed || false);
    this.distributing = ko.observable(data.distributing || false);
    this.flipping = ko.observable(data.flipping || '');
    this.left = ko.observable(data.left || 0);
    this.top = ko.observable(data.top || 0);
    this.descId = data.descId || '';
};

CardViewModel.prototype.reverse = function () {
    this.reversed(!this.reversed());
    return this;
};

CardViewModel.prototype.flipFromReversed = function () {
    var duration = 150;  //ATTENTION: sync with value in stylesheet
    var self = this;
    if (supportsCssTransitions)
    {
        //effect 'flip' with pop
        self.flipping('before'); //=> invoke css animation
        setTimeout(function () {
            self.reversed(false);
            self.flipping('after'); //=> invoke css animation
            setTimeout(function () {
                self.flipping('');
                //TODO: deferred.promise() 
            },duration/ 2);
        }, duration / 2);
        //TODO: return deffered;
    }
    else
    {
        //TODO: re-impl animation by using 'top', 'width', and  'left'
        self.reversed(false);

        //TODO: return deffered;
    }
};



var MainViewModel = function (deviceViewMode, spread) {   
    var cardViewModels = ko.observableArray(
        ko.utils.arrayMap(cardData, function (x) {
            return new CardViewModel(x);
        })
    );
    
    var shrinkMat = ko.computed(function () {
        return deviceViewModel.width() < spread.width;
    });
    
    var revolutionRadius = ko.computed(function () {
        var defaultRadius = 180,
            margin = 20,
            cardHalfWidth = 50;
        var radius = Math.min(defaultRadius, deviceViewModel.width() / 2 -cardHalfWidth - margin);
        
        return !shrinkMat()? radius : 0;
    });

    var revolutionOn = ko.observable(false);

    //console.log('Created main model for ' + $root.data('title')); 

    this.spread = spread; //need this?
	this.revolutionRadius = revolutionRadius;
    this.shrinkMat = shrinkMat;
    this.matWidth = ko.computed(function () {
        var cardWidth = 100;
        return !shrinkMat()? config.spread().width : cardWidth;
    }, this);
    this.matHeight = ko.computed(function () { return spread.height; });
    this.placeholders = ko.computed(function () {
        return spread.placeholders;
    }, this);
    this.revolutionAnimating = ko.computed(function () {
        //don't use r…() && shr...()
        var r = revolutionOn(),
            shr = shrinkMat();
        return r && !shr;
    }, this);
    this.hasDone = ko.observable(false);
    this.revolutionMarginTop = ko.computed(function () {
        var m = revolutionRadius() ;
        return !this.hasDone()? m + 70.5 : 0;
    }, this);
    this.revolutionContainerTop = ko.computed(function () {
        var m = revolutionRadius() ;
        return !this.hasDone()? 0 : m + 70.5;
    }, this);
    this.revolutionContainerHeight = ko.computed(function () {
        var h = (revolutionRadius() * 2);
        return !this.hasDone()? h : 0;
    }, this);
    this.cards = cardViewModels;
    this.revolutionOn = revolutionOn;
};

VStackUtil = function () {};
VStackUtil.margin = 10;
VStackUtil.height = 141;
VStackUtil.topOf = function (index) {
    return (this.margin + this.height) * index;
}

MainViewModel.prototype.distribute = function (deltaOffset) {
    var self = this,
        placeholders = this.placeholders(),
        cards = this.cards(),
        n = placeholders.length;
    
    //TODO: bugfix for shrinkMat mode!!!
    //TODO: support rotateZ() in order to realize celtic-cross.
    var reqDistributes = new Array(n);                
    $.each(placeholders, function (i, placeholder) {
        //console.log('STEP1-' + i);
        var delay = 120,
            duration = 200; //ATENTION: sync with css
        var deferred = $.Deferred();
        
        var rIndex = cards.length - 1 - i,
            card = cards[rIndex];
        
        if (supportsCssTransitions)
        {
            //use CSS Transition
            card.distributing(true);
            setTimeout(function () {
                if (!self.shrinkMat()) {
                    card.top(deltaOffset.top + (placeholder.top || 0));
                    card.left(deltaOffset.left + (placeholder.left || 0));
                }
                else
                {
                    /* ATTENTION: sync with css */
                    var margin = 10,
                        h = 141;
                    card.top(VStackUtil.topOf(i) + deltaOffset.top);
                    card.left(0 + deltaOffset.left);
                }
                setTimeout(function () {
                    card.distributing(false);
                    deferred.resolve(card);
                }, duration);
            }, delay * i);
        }
        else
        {
            if (!self.shrinkMat()) {
                card.top(deltaOffset.top + (placeholder.top || 0));
                card.left(deltaOffset.left + (placeholder.left || 0));
                //TODO: animation
            }
            else
            {
                var top0 = card.top(), left0 = card.left();
                $({t: 0}).
                    delay(150 * i).
                    animate({t: 1}, {
                    duration: duration,
                    easing: 'linear',
                    step: function (t){
                        card.top(top0 * (1 - t) + (deltaOffset.top + (placeholder.top || 0)) * t);
                        card.left(left0  * (1 - t) + (deltaOffset.left + (placeholder.left || 0)) * t);
                    },
                    complete: function () {
                        deferred.resolve(card);
                    }
                });
            }
        }
        reqDistributes[i] = deferred.promise();
        //console.log("    => " + card.nameJa);
    });
    
    return reqDistributes;
};

MainViewModel.prototype.focus = function (parentElement, index, cardViewModel) {
    var self = this;

    if (!self.shrinkMat()) {
        
    } else {
        var offsetY = VStackUtil.topOf(index) + 40;
        $(window).scrollTop($(parentElement).position().top + offsetY);
    }
};

MainViewModel.prototype.restart = function () {
    if (!this.hasDone()) return;
    
    index = 0; //bind!
    ko.utils.arrayForEach(this.cards(), function (card) {
        card.reversed(true);
        card.left(0);
        card.top(0); //TODO: animation
    });
    this.cards.shuffle();
    //revolution.start();
    
    this.hasDone(false);
};



var relativeOffset = function (from,  to) {
    var dst = $(to).offset(),
        src = $(from).offset(),
        delta = {top: dst.top - src.top, left: dst.left - src.left};
    //WARN
    if ($(to).filter(':visible').length === 0)  console.log($(to).get(0), '(to) is invisible');
    if ($(from).filter(':visible').length === 0)  console.log($(from).get(0), '(from) is invisible');
    return delta;
};

var reqTemplateLoad = $.get('template-card.html', function(html) {
    $('body').append('<div style="display:none">' + html + '</div>');
});

var deviceViewModel  = (new function () {
    var width = ko.observable(0);
    
    /**** device width detectiong *****/
    $(document).on('pageshow', function () {
        $(window).trigger('resize');
    });
    $(window).bind('resize', function () {
        width($('*[data-role="page"]').first().width());
    });
    
    this.width = width;
} ());

/**** pageinit ****/
$(document).on('pageinit', function (e) {
    var mainViewModel = new MainViewModel(deviceViewModel, config.spread());

    $.when(reqTemplateLoad).then(function () {
        var $root = $(e.target);
    
        // Start binding with DOM
        ko.applyBindings(mainViewModel, e.target);
        
        $root.find('.requires-jquery-mobile-pageinit').
            find('button, a[data-role="button"]').
            button().
            end().
            find('*[data-role="popup"]').
            init().popup().
            end().
            find('a[href]').
            init();
        
    //wait updating DOM especially on 2nd pageinit.
    //setTimeout(function () {
        // Step 0.
        // TODO: effect reverse and shufle
        
        // reverse
        ko.utils.arrayForEach(mainViewModel.cards(), function (item) { item.reversed(true); });
        
        // shuffle once
        // TODO: provide reshuffle button
        mainViewModel.cards.shuffle();
        
        //revoluting cards
        // TODO: create Controller object.
        //       or change this into starting function to return stop function…
        var revolution = (new function () {
            var radiusSubscription,
                $deckCards= $root.find('.deck .card'),
                $container = $root.find('.revolution-container'),
                n = $deckCards.length;
            
            var setAnimationProperties = function () {
                //ATTENTION: sync with value in stylesheet
                //           animation setting has done via css animations
                $deckCards.each(function (i, item) {
                    var $item = $(item);
                    $item.css({
                                /*'position': 'absolute',
                                'top': '0',
                                'left': '0',*/
                                'zIndex': 10 + n - i,
                                'transform-origin': 'center center',
                                'transform': 'rotate(' + (90 + 360 * i / n) +'deg) translateX(' + mainViewModel.revolutionRadius() + 'px)'
                    });
                });
            };
    
            this.start = function () {
                
                //initialize position
                setAnimationProperties();
                radiusSubscription = mainViewModel.revolutionRadius.subscribe(setAnimationProperties); //will mutated on window.resize event.s
    
                mainViewModel.revolutionOn(true);
            };
                          
            this.stop = function () {
                if (radiusSubscription)  radiusSubscription.dispose();
                $container.
                    addClass('paused');
                    //TODO: set keyframe 0% ... how?
                
                var deferred = $({t: 1}).animate({t: 0},
                    {
                        duration: 200,
                        step: function (t) {
                            $deckCards.each(function (i, item) {
                                var $item = $(item);
                                $item.css({
                                    'transform': 'rotate(' + (360 * i / n) * t +'deg) translateX(' + mainViewModel.revolutionRadius * t+ 'px)'
                                });
                            });
                        },
                        complete: function () {
                            $deckCards.css('transform', 'none');
                            mainViewModel.revolutionOn(false);
                        }
                    }
                );
                return deferred;
            };
        } ());
        
        var CardRevelealer = function (reqDistributes, stepFn) {
            var index = 0,
                deferred = $.Deferred(),
                n = reqDistributes.length,
                cards = new Array(n);
                
            stepFn = stepFn || emptyFn;
                
            this.showEachCard = function () {
                if (index < n)
                {
                    $.when(reqDistributes[index]).then(function (cardViewModel) {
                        //console.log('STEP2-' + index + '/' + reqDistributes.length);
                        
                        //scroll to a card to be shown
                        //$(window).scrollTop($card.offset().top);
                        //TODO: implement like catalog viewer
                        cardViewModel.flipFromReversed();
                        cards[index] = cardViewModel;
                        stepFn.apply(this, [index, cardViewModel]);
                        ++index;
                    }); //when-then
                }
                else
                {
                    deferred.resolve(cards);
                } //if-else
                return deferred.promise();
            };
        }; //CardRevelealer
        
        var emptyFn = function () {};
        
        //click handler
        var goToNext = emptyFn;
        
        // Step 0.
        var step0 = function () {
            //stop and go to step1 instantly
            $.when(revolution.stop()).then(step1);
            //wait until step1 will have been done.
            goToNext = emptyFn;
        }; //step0
        
        // Step 1.
        var step1 = function () {
            //console.log('STEP1');
           
            // -- distribute
            // TODO: wait clicked -> Do it just after the card is opened!
            var deltaOffset = relativeOffset($root.find('.deck'), $root.find('.mat>div'));
            
            //TODO: subscribe revolutionRadius ...
            
            var reqDistributes = mainViewModel.distribute(deltaOffset);
            
            goToNext = function () {
            
                // Step 2... 2 + N
                var cardRevlealer = new CardRevelealer(reqDistributes, function (index, card) {
                    mainViewModel.focus(
                        $root.find('.mat>div'),
                        index, card);
                });
                
                //initial
                var allShown = cardRevlealer.showEachCard();                
                
                //iteration
                goToNext = function () { cardRevlealer.showEachCard(); };

                //followings
                $.when(allShown).then(function () {
                     // Final step => restart or leave
                     //console.log('STEP2-FIN!');
                     goToNext = function () { setTimeout(step0, 150); };                            
                     mainViewModel.hasDone(true);
                });
            }; //goToNext
        }; //step1
        
        //set initial handler
        goToNext = step0;
        
        //step by clicked/tapped
        $root.on('vclick', function () {
            if (mainViewModel.hasDone()) return;
            
            goToNext.call();
        });
    
        //start animation
        revolution.start();
        
    //}); //setTimeout
    }); //when-then
    
}); //pageinit

} (jQuery, ko));