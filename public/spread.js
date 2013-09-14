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

var supportsCssAnimation = true;

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

/**** pageinit ****/
//TODO: separate pageshow

$(document).on('pageinit', function (e) {

$.when(reqTemplateLoad).then(function () {
setTimeout(function () {
    // Step 0.
    var radius = 180;
    
	var $root =$(e.target);

    if ($root.find('.mat').length === 0) return;    //start
        
    //----> NO GO
    var cardViewModels = ko.observableArray(
        ko.utils.arrayMap(cardData, function (x) {
            return new CardViewModel(x);
        })
    );    
	
    // Start binding with DOM before pagecreate by jQuery Mobile!
    ko.applyBindings({
        cards: cardViewModels
    });
    
    // reverse
    ko.utils.arrayForEach(cardViewModels(), function (item) { item.reversed(true); });
    
    // shuffle once
    // TODO: provide reshuffle button
    cardViewModels.shuffle();
    
    var revolution = (new function () {
        var $deckCards= $root.find('.deck .card'),
            $container = $root.find('.revolution-container');
            n = $deckCards.length;
        
        this.start = function () {
            //revoluting cards
            //ATTENTION: sync with value in stylesheet
            //           animation setting has done via css animations
            
            //initialize position
            $deckCards.each(function (i, item) {
                var $item = $(item);
                $item.css({
                            'position': 'absolute',
                            'top': 0 + 'px',
                            'left': '0',
                            'transform-origin': 'center center',
                            'transform': 'rotate(' + (90 + 360 * i / n) +'deg) translateX(' + radius + 'px)'
                });
            });
            
            $container.addClass('animating');
        };
                      
        this.stop = function () {
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
                                'transform': 'rotate(' + (360 * i / n) * t +'deg) translateX(' + radius * t+ 'px)'
                            });
                        });
                    },
                    complete: function () {
                        $deckCards.css('transform', 'none');
                        $container.removeClass('animating');
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
        var reqDistributes, posedCards;
       
        // -- distribute
        // TODO: wait clicked -> Do it just after the card is opened!
        (function () {
            var $deckCards, $placeholders;
            
            reqDistributes = [];
            
            $deckCards= $root.find('.deck .card');

            $placeholders = $root.find('.mat .card.placeholder').each(function (i, placeholder) {
                var $card = $($deckCards.get($deckCards.length - 1 - i)),
                    delta = relativeOffset($card, placeholder),
                    queue;
                
                posedCards = new Array();
                queue = $card.
                    delay(150 * i).
                    animate({top: '+=' + delta.top + 'px', left: '+=' + delta.left + 'px'}, 180, 'swing', function () {
                        posedCards.push(this); //TODO: pass by jQuery.Deferred
                    });
                reqDistributes.push(queue);
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
                                duration = 150;  //ATTENTION: sync with value in stylesheet
                            
                            //effect 'flip' with pop
                            if (supportsCssTransitions)
                            {
                                $card.
                                    queue(function () {
                                        $card.addClass('flipping-before'); //=> invoke css animation
                                        setTimeout(function () {
                                            $card.removeClass('reversed'); //TODO: update ViewModel.reversed
                                            $card.addClass('flipping-after'); //=> invoke css animation
                                            $card.delay(duration/ 2);
                                            //TODO: deferred.promise() 
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
                                        $card.removeClass('reversed');
                                    }).
                                    animate({top: pos.top + 'px', left: pos.left + 'px', width: width + 'px'}, duration / 2, 'swing');
                                //TODO: return deffered;
                            }
                            ++index;
                        }
                        else
                        {
                            // Final step
                            goToNext = emptyFn;
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
    $(document).on('vclick', function () {
        goToNext.call();
    });

    //start animation
    revolution.start();
    
}); //setTimeout
}); //when-then

}); //pageshow

} (jQuery, ko));