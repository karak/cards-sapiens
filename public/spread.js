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
    descId: ''
}, {
    nameEn: "The High Priestess",
    nameJa: "女教皇",
    descId: ''
}, {
    nameEn: "The Empress",
    nameJa: "女帝",
    descId: ''
}, {
    nameEn: "The Emperor",
    nameJa: "皇帝",
    descId: ''
}, {
    nameEn: "The Hierophant",
    nameJa: "教皇",
    descId: ''
}, {
    nameEn: "The Lovers",
    nameJa: "恋人達",
    descId: ''
}, {
    nameEn: "The Chariot",
    nameJa: "戦車",
    descId: ''
}, {
    nameEn: "Justice",
    nameJa: "正義",
    descId: ''
}, {
    nameEn: "The Hermit",
    nameJa: "隠者",
    descId: ''
}, {
    nameEn: "The Wheel of Fortune",
    nameJa: "運命の輪",
    descId: ''
}, {
    nameEn: "Strength",
    nameJa: "力",
    descId: ''
}, {
    nameEn: "The Hanged Man",
    nameJa: "吊された男",
    descId: ''
}, {
    nameEn: "Death",
    nameJa: "死神",
    descId: ''
}, {
    nameEn: "Temperance",
    nameJa: "節制",
    descId: ''
}, {
    nameEn: "The Devil",
    nameJa: "悪魔",
    descId: ''
}, {
    nameEn: "The Tower",
    nameJa: "塔",
    descId: ''
}, {
    nameEn: "The Star",
    nameJa: "星",
    descId: ''
}, {
    nameEn: "The Moon",
    nameJa: "月",
    descId: ''
}, {
    nameEn: "The Sun",
    nameJa: "太陽",
    descId: ''
}, {
    nameEn: "Judgement",
    nameJa: "審判",
    descId: ''
}, {
    nameEn: "The World",
    nameJa: "世界",
    descId: ''
}];

var CardViewModel = function (data) {
    this.nameJa = data.nameJa;
    this.nameEn= data.nameEn;
    this.reversed = ko.observable(data.reversed || false);
};

CardViewModel.prototype.reverse = function () {
    this.reversed(!this.reversed());
    return this;
};

var relativeOffset = function (from,  to) {
    var dst = $(to).offset(),
        src = $(from).offset(),
        delta = {top: dst.top - src.top, left: dst.left - src.left};
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
var mainViewModel = undefined;

$(document).on('pageinit', function (e) {
	var $root =$(e.target);
    
    var cardViewModels = ko.observableArray(
        ko.utils.arrayMap(cardData, function (x) {
            return new CardViewModel(x);
        })
    );
    
    var shrinkMat = ko.computed(function () {
        return deviceViewModel.width() < config.spread().width;
    });
    
    var revolutionRadius = ko.computed(function () {
        var defaultRadius = 180,
            margin = 20,
            cardHalfWidth = 50;
        var radius = Math.min(defaultRadius, deviceViewModel.width() / 2 -cardHalfWidth - margin);
        
        return !shrinkMat()? radius : 0;
    });

    var revolutionOn = ko.observable(false);
	
    mainViewModel = (new function () {
        this.spread = config.spread;
    
    	this.revolutionRadius = revolutionRadius;
        this.shrinkMat = shrinkMat;
        this.matWidth = ko.computed(function () {
            var cardWidth = 100;
            return !shrinkMat()? config.spread().width : cardWidth;
        });
        this.matHeight = ko.computed(function () { return config.spread().height; });
        this.placeholders = ko.computed(function () {
            return config.spread().placeholders;
        });
        this.revolutionAnimating = ko.computed(function () {
            //don't use r…() && shr...()
            var r = revolutionOn(),
                shr = shrinkMat();
            return r && !shr;
        });
        this.cards = cardViewModels;
        this.revolutionOn = revolutionOn;
        this.hasDone = ko.observable(false);
    } ());
}); //pageinit

$(document).on('pageshow', function (e) {
$.when(reqTemplateLoad).then(function () {
    var $root = $(e.target);

    // Start binding with DOM
    ko.applyBindings(mainViewModel);
    
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
                            'position': 'absolute',
                            'top': 0 + 'px',
                            'left': '0',
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
    
    var emptyFn = function () {};
    
    //click handler
    var goToNext = emptyFn;
    
    // Step 0.
    var step0 = function () {
        //stop and go to step1 instantly
        var reqStop = revolution.stop();
        $.when(reqStop).then(step1);
        goToNext = emptyFn;
    }; //step0
    
    // Step 1.
    var step1 = function () {
        console.log('STEP1');
        var reqDistributes, posedCards, posedCardViewModels;
       
        // -- distribute
        // TODO: wait clicked -> Do it just after the card is opened!
        (function () {
            var $deckCards, $placeholders, n;
            $deckCards = $root.find('.deck .card');
            $placeholders = $root.find('.mat .card.placeholder');
            n = $placeholders.length;
            console.log(n, 'placeholders found?');
            
            reqDistributes = new Array(n);
            posedCardViewModels = new Array(n);
            posedCards = new Array(n);
            
            $placeholders.each(function (i, placeholder) {
                console.log('STEP1-' + i);
                var deckIndex = $deckCards.length - 1 - i,
                    $card = $($deckCards.get(deckIndex)),
                    cardViewModel = mainViewModel.cards()[deckIndex],
                    delta = relativeOffset($card, placeholder),
                    queue = $card.
                        delay(150 * i).
                        animate({top: '+=' + delta.top + 'px', left: '+=' + delta.left + 'px'}, 180, 'swing');
                        //TODO: BUG. Same card doesn't move at 2nd iteration.
                posedCardViewModels[i]  = cardViewModel;
                posedCards[i] = $card; //TODO: pass by jQuery.Deferred
                reqDistributes[i] = queue;
                console.log("    => " + cardViewModel.nameJa);
            });
        } ());
        
        goToNext = function () {
            $.when(reqDistributes).then(function () {
                // Step 2... 2 + N
                
                var showOneCard = (function () {
                    var index = 0;
                    
                    return function () {
                        if (index < posedCards.length)
                        {
                            var $card = $(posedCards[index]),
                                cardViewModel = posedCardViewModels[index],
                                duration = 150;  //ATTENTION: sync with value in stylesheet
                            
                            console.log('STEP2-' + index + '/' + posedCards.length);
                            //effect 'flip' with pop
                            if (supportsCssTransitions)
                            {
                                $card.
                                    queue(function () {
                                        $card.addClass('flipping-before'); //=> invoke css animation
                                        setTimeout(function () {
                                            cardViewModel.reversed(false);
                                            $card.addClass('flipping-after'); //=> invoke css animation
                                            setTimeout(function () {
                                                $card.removeClass('flipping-before')
                                                     .removeClass('flipping-after');
                                                //TODO: deferred.promise() 
                                            },duration/ 2);
                                        }, duration / 2);
                                    });
                                //TODO: return deffered;
                            }
                            else
                            {
                                var width = $card.width(),
                                    pos = $card.position();
                                    
                                //It did not work "-=/+=" notation.  BUG in jQuery?
                                $card.
                                    animate({top: (pos.top - 18) + 'px', left: (pos.left + width / 2) + 'px', width: '0px'}, duration / 2, function () {
                                        cardViewModel.reversed(false);
                                    }).
                                    animate({top: pos.top + 'px', left: pos.left + 'px', width: width + 'px'}, duration / 2, 'swing');
                                //TODO: return deffered;
                            }
                            ++index;
                        }
                        else
                        {
                            // Final step => restart
                            console.log('STEP2-FIN!');
                            // TODO: restart
                            goToNext = emptyFn;
                            /*
                            index = 0;
                            goToNext = step0; //go to 1st again
                            
                            var $deckCards = $root.find('.deck .card');
                            $deckCards.css({left: 0, top: 0}).addClass('reversed');
                            ko.utils.arrayForEach(mainViewModel.cards(), function (card) {
                                card.reversed(true);
                            });
                            mainViewModel.cards.shuffle();
                            //revolution.start();
                            */
                            mainViewModel.hasDone(true);
                        }
                    };
                } ());
                
                //initial
                showOneCard();
                
                //wait next
                goToNext = showOneCard;
            });
        };
    }; //step1
    
    //set initial handler
    goToNext = step0;
    
    //step by clicked/tapped
    $root.on('vclick', function () {
        if (!mainViewModel.hasDone()) {
            goToNext.call();
        }
    });

    //start animation
    revolution.start();
    
//}); //setTimeout
}); //when-then

}); //pageshow

} (jQuery, ko));