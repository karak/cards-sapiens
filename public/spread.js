/******** library aux ********/
if (!Array.prototype.forEach)
{
    Array.prototype.forEach = function(f, obj) {
        var n = this.length, i;
        obj = obj || this;
        for (i = 0; i < n; i++)
        {
            f.call(obj, this[i], i, this);
        }
    };
}

if (!Array.prototype.indexOf) {
  Array.prototype.indexOf = function (searchElement /*, fromIndex */ ) {
    "use strict";

    if (this == null) {
      throw new TypeError();
    }

    var t = Object(this);
    var len = t.length >>> 0;

    if (len === 0) {
      return -1;
    }

    var n = 0;

    if (arguments.length > 0) {
      n = Number(arguments[1]);

      if (n != n) { // shortcut for verifying if it's NaN
        n = 0;
      } else if (n != 0 && n != Infinity && n != -Infinity) {
         n = (n > 0 || -1) * Math.floor(Math.abs(n));
      }
    }

    if (n >= len) {
      return -1;
    }

    var k = n >= 0 ? n : Math.max(len - Math.abs(n), 0);

    for (; k < len; k++) {
      if (k in t && t[k] === searchElement) {
        return k;
      }
    }
    return -1;
  }
}
if (!Array.prototype.every)
{
  Array.prototype.every = function(fun /*, thisp */)
  {
    "use strict";

    if (this == null)
      throw new TypeError();

    var t = Object(this);
    var len = t.length >>> 0;
    if (typeof fun != "function")
      throw new TypeError();

    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in t && !fun.call(thisp, t[i], i, t))
        return false;
    }

    return true;
  };
}
// Production steps of ECMA-262, Edition 5, 15.4.4.19
// Reference: http://es5.github.com/#x15.4.4.19
if (!Array.prototype.map) {
  Array.prototype.map = function(callback, thisArg) {

    var T, A, k;

    if (this == null) {
      throw new TypeError(" this is null or not defined");
    }

    var O = Object(this);

    var len = O.length >>> 0;

    if ({}.toString.call(callback) != "[object Function]") {
      throw new TypeError(callback + " is not a function");
    }
    if (thisArg) {
      T = thisArg;
    }
    A = new Array(len);
    k = 0;
    while(k < len) {

      var kValue, mappedValue;
      if (k in O) {
        kValue = O[ k ];
        mappedValue = callback.call(T, kValue, k, O);
        A[ k ] = mappedValue;
      }
      k++;
    }
    return A;
  };      
}

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


var config = (function () {
    var configData = {};

    return function () {
        //switch by page
        var currentPageId = $('.ui-page-active').attr('id');
        if (arguments.length === 0) {
            //get
            return configData[currentPageId];
        }
        else
        {
            //set
            return configData[currentPageId] = arguments[0];
        }
    }
} ());

/**************** storage ******************/
var appDb = (function () {

var spreadNames = ["one-oracle", "fortune", "near-future", "project", "sentiment",
                   "destined-mate", "hexagram", "celtic-cross"];

var cardNames = [
    //major
    "the-fool",
    "the-magician", "the-high-priestess", "the-empress", "the-emperor", "the-hierophant",
    "the-lovers", "the-chariot", "strength", "the-hermit", "the-wheel-of-fortune",
    "justice", "the-hanged-man", "death", "temperance", "the-devil",
    "the-tower", "the-star", "the-moon", "the-sun", "judgement",
    "the-world"
];

var alwaysFail = function () {
    var deferred = $.Deferred();
    deferred.reject('This funcion always fail');
    return deferred.promise();
};

var appDb = (new function () {
    var supportsWebSql = 'openDatabase' in window;
    var db = supportsWebSql? openDatabase("spread", "1.0", "spread application", 4096) : {};
    
    var execute = alwaysFail;
    var transaction = alwaysFail;
    if (supportsWebSql) {
        transaction = function (callback) {
            var self = this;
            var deferred = $.Deferred();
            var subPromise;
    
            db.transaction(
                function (tx) {
                    var mayPromise = callback.apply(db, arguments);
                    if (mayPromise) {
                        subPromise = mayPromise;
                        mayPromise.done(function () { deferred.resolve.apply(self, arguments); }).
                                   fail(function () { deferred.reject.apply(self, arguments); });
                    }
                },
                function (err) {
                    if (!subPromise)
                    {
                        deferred.reject.apply(self, arguments);
                    }
                },
                function () {
                    if (!subPromise)
                    {
                        deferred.resolve.apply(self, arguments);
                    }
                }
            );
            return deferred.promise();
        };

        execute = function (tx, statement) {
            var params = Array.prototype.slice.apply(arguments, [2]),
                deferred = $.Deferred();
            tx.executeSql(statement, params, function (tx, resultSet) {
                deferred.resolve(resultSet);
            },
            function (tx, err) {
                console.log("SQL execution error: \"" + statement + "\"", err);
                deferred.reject(tx, err);
            });
            return deferred.promise();
        };
        
        /* initialize */
        db.transaction(
            function (tx) {
                execute(tx, "CREATE TABLE IF NOT EXISTS system(version INTEGER)");
                execute(tx, "CREATE UNIQUE INDEX IF NOT EXISTS system_version ON system(version)");
                execute(tx, "INSERT OR IGNORE INTO system (version) VALUES(1)"); //version 1
                
                execute(tx, "CREATE TABLE IF NOT EXISTS spreads(id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(256))");
                execute(tx, "CREATE UNIQUE INDEX IF NOT EXISTS spreads_name ON spreads(name)");
                execute(tx, "SELECT COUNT (*) AS count FROM spreads").
                then(function (rs) {
                    var row = rs.rows.item(0);
                    if (row.count === 0)
                    {
                        spreadNames.forEach (function (name) {
                            execute(tx, "INSERT INTO spreads (name) VALUES(?)", name);
                        });
                    }
                });
    
                execute(tx, "CREATE TABLE IF NOT EXISTS cards(id INTEGER PRIMARY KEY AUTOINCREMENT, name VARCHAR(256))");
                execute(tx, "CREATE UNIQUE INDEX IF NOT EXISTS cards_name ON cards(name)");
                execute(tx, "SELECT COUNT (*) AS count FROM cards").
                then(function (rs) {
                    var row = rs.rows.item(0);
                    if (row.count === 0)
                    {
                        cardNames.forEach (function (name) {
                            execute(tx, "INSERT INTO cards (name) VALUES(?)", name);
                        });
                    }
                });
    
                execute(tx, "CREATE TABLE IF NOT EXISTS activities(id INTEGER PRIMARY KEY AUTOINCREMENT, spread_id INTEGER NOT NULL, note VARCHAR(4096) NOT NULL DEFAULT '', timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP)");
                execute(tx, "CREATE INDEX IF NOT EXISTS activities_spread_id ON activities(spread_id)");
                execute(tx, "CREATE TABLE IF NOT EXISTS activity_card(activity_id INTEGER NOT NULL, position INTEGER NOT NULL, card_id INTEGER)");
                execute(tx, "CREATE INDEX IF NOT EXISTS activity_card_activity_id_position ON activity_card(activity_id, position)");
            },
            function (err) {
                //TODO: fix
                console.log('fail to initialize db', err);
            },
            function () {
            }
        );
    }
    
    
    // Activity model

    this.enabled = supportsWebSql;

    /**
     * Save new activity.
     *
     * @param {String} spreadName
     * @param {Array} cardNameArray
     * @param {String} note
     */
    this.saveNewActivity = function (spreadName, cardNameArray, note) {
        return transaction(function (tx) {
            execute(tx, "INSERT INTO activities (spread_id, note) VALUES ((SELECT id FROM spreads WHERE name = ? LIMIT 1), ?)", spreadName, note).then(function (rs) {
                var activityId = rs.insertId;
                cardNameArray.forEach(function (cardName, index) {
                    execute(tx, "INSERT INTO activity_card (activity_id, position, card_id) VALUES (?, ?, (SELECT id FROM cards WHERE name = ? LIMIT 1))", activityId, index + 0, cardName);
                });
            });
        });
    };

    this.countOfActivities = function () {
        return transaction(function (tx) {
            //return count by names of spread.
            var deferred = $.Deferred();
            var counts = {};

            execute(tx, "SELECT spreads.name spreadName, (SELECT COUNT(*) FROM activities WHERE activities.spread_id = spreads.id) count FROM spreads").
                done(function (rs) {
                    for (var i = 0; i < rs.rows.length; i++) {
                        var row = rs.rows.item(i);
                        counts[row.spreadName] = row.count;
                    }
                    deferred.resolve(counts);
                }).
                fail(function (err) {
                    deferred.reject(err);
                });

            return deferred.promise();
        });
    };
} ()); //appDb

return appDb;

} ());

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



var MainViewModel = function (deviceViewMode, config) {   
    var cardViewModels = ko.observableArray(
        ko.utils.arrayMap(cardData, function (x) {
            return new CardViewModel(x);
        })
    );
    
    var shrinkMat = ko.computed(function () {
        return deviceViewModel.width() < config.width;
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

	this.revolutionRadius = revolutionRadius;
    this.shrinkMat = shrinkMat;
    this.matWidth = ko.computed(function () {
        var cardWidth = 100;
        return !shrinkMat()? config.width : cardWidth;
    }, this);
    this.matHeight = ko.computed(function () { return config.height; });
    this.placeholders = ko.computed(function () {
        return config.placeholders;
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

    //sub app
    this.activity = new ActivityLogViewModel(config.name);
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
    var tmpDistributedCards = new Array(n);

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

        tmpDistributedCards[i] = card;
        //console.log("    => " + card.nameJa);
    });
    
    // update activity viewmodel
    self.activity.cards(tmpDistributedCards);

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

    //reset sub app as well
    this.activity.restart();
    this.supportsActivityLog = appDb.enabled;
};

function toHyphenForm (x) {
    return x.toLowerCase().replace(' ', '-');
}

ActivityLogViewModel = function (spreadName) {
    var self = this;

    //properties
    self.onceSaved = ko.observable(false);

    self.note = ko.observable('');
    self.cards = ko.observableArray();

    // write functions

    self.save = function () {
        var reqSave = appDb.saveNewActivity(
            toHyphenForm(spreadName),
            self.cards().map(function (card) { return toHyphenForm(ko.utils.unwrapObservable(card.nameEn)); }),
            self.note()
        );

        $.when(reqSave).then(function () {
            self.note('');
            self.onceSaved(true);
        });
    };
    
    self.restart = function () {
        //NOTE: inherit spreadName
        self.note('');
        self.cards([]);
        self.onceSaved(false);
    };
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
var spreadPageInit = function (e, config) {    
    var mainViewModel = new MainViewModel(deviceViewModel, config);

    $.when(reqTemplateLoad).then(function () {
        var $root = $(e.target);
    
        // Start binding with DOM
        ko.applyBindings(mainViewModel, e.target);
        
        $root.find('.requires-jquery-mobile-pageinit').
              trigger('create');
        
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
    
};

var indexPageInit = function (e, config)
{
    //TODO: Viewmodels for an index page

    var data = ko.observable({});

    appDb.countOfActivities().then(function (counts) {
        data(counts);
    });

    ko.applyBindings({
        spreads: data,
        supportsActivityLog: appDb.enabled
    });
};

$(document).on('pageinit', function (e) {
    //config should be defined in page html!
    var currentPageConfig = config();

    if (currentPageConfig !== undefined)
    {
        //spread page
        spreadPageInit(e, currentPageConfig);
    }
    else
    {
        //init or dictionary
        indexPageInit(e, currentPageConfig);
    }

}); //pageinit


} (jQuery, ko));