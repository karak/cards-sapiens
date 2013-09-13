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

(function ($, ko) {
    
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

/*
1. テンプレートのロード
2. ko binding によるDOM書き換え
3. ページ初期化
という順序にしたい。
そのため、基本自動初期化は無効にする。
*/
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
    var leftCancel = -radius / 2;

    var initialAnimationController;
    
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
/*
}); //setTimeout
}); //when-then

}); //pageinit

$(document).on('pageshow', function (e) {

$.when(reqTemplateLoad).then(function () {
setTimeout(function () {
*/
    // reverse
    ko.utils.arrayForEach(cardViewModels(), function (item) { item.reversed(true); }); //TODO: effect 'flip'
    
    // shuffle once
    // TODO: provide reshuffle button
    cardViewModels.shuffle();
    
	(function () {
        //revoluting cards...
        var $origin = $root.find('.start-place'),
            $deckCards= $root.find('.deck .card');

        var queue;
        
        var lastNow;
        var revoluteRec = function () {
            queue = $({deg: 0}).animate({deg: 360}, {
                duration: 2000,
                easing: 'linear',
                step: function (now) {
                    var n = $deckCards.length,
                        d = 360.0 / n;
                    $deckCards.each(function (i, card) {
                        var angle = now + d * i;
                        $(card).
                            css({
                                transform: 'rotate(' + angle + 'deg)' + ' translateX(' + radius + 'px)' 
                            });
                        lastNow = now;
                    });
                },
                complete: function () {
                    //continue infinitely...
                    revoluteRec();
                }
            });
        };
        
        //initialize origin
        $deckCards.each(function (i, item) {
            var delta = relativeOffset(item, $origin);
            $(item).css({
                left: leftCancel + 'px',
                'transform-origin': 'center center'
            });
        });

        
        initialAnimationController = {
            resetPosition: function (callback) {
                queue.stop();
                $({t: 1}).animate({t: 0}, {
                    duration: 120,
                    step: function (t) {
                        var n = $deckCards.length,
                            d = 360.0 / n;
                        $deckCards.each(function (i, card) {
                            var myLastAngle = (lastNow + d * i);;
                            var angle = myLastAngle * t;
                            $(card).
                                css({
                                    transform: 'rotate(' + angle + 'deg)' + ' translateX(' + radius * t + 'px)' 
                                });
                        });
                    },
                    complete: function () {
                        callback();
                    }
                });
            } //resetPosition
        };
        
        //start
        revoluteRec();
    } ());
	
    var emptyFn = function () {};
    var goToNext = function () {
        // Step 1.
        initialAnimationController.resetPosition(function () {
        
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
                        animate({top: delta.top + 'px', left: delta.left + leftCancel + 'px'}, 180, 'swing', function () {
                            posedCards.push(this);
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
                                    width = $card.width(),
                                    duration1 = 50,
                                    duration2 = 50;
                                
                                //effect 'flip' with pop
                                if (supportsCssTransitions)
                                {
                                    $card.
                                        animate({'top': '-=18px', transform: "scaleX(" + 100 + "%)"}, duration1, 'swing', function () {
                                            $card.removeClass('reversed'); //TODO: update ViewModel.reversed
                                        }).
                                        animate({'top': '+=18px', transform: "scaleX(" + 0 + "%)"}, duration2, 'swing', function () {
                                        });
                                }
                                else
                                {
                                    $card.
                                        animate({'top': '-=18px', width: '0', left: '+=' + width / 2 + 'px'}, duration1, 'swing', function () {
                                            $card.removeClass('reversed');
                                        }).
                                        animate({'top': '+=18px', width: width + 'px', left: '-=' + width / 2 + 'px'}, duration2, 'swing', function () {
                                        });
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
        }); //resetPosition
    }; //goToNext #1
    
    $(document).on('vclick', function () {
        goToNext.call();
    });

}); //setTimeout
}); //when-then

}); //pageshow

} (jQuery, ko));