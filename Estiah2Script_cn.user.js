// ==UserScript==
// @name        Estiah2Script_cn
// @namespace   https://github.com/wxyz202
// @description the greasemonkey script for estiah2
// @include     http://cn.estiah2.com/zh/*
// @include     http://www.estiah2.com/zh/*
// @version     0.1
// @grant       none
// @require     http://code.jquery.com/jquery-1.11.0.min.js
// ==/UserScript==

var JQ = jQuery.noConflict();


var PageHandler = function(pattern, init_func){
    this.pattern = pattern;
    this.init_func = init_func;
};
PageHandler.prototype.match = function() {
    var pathname = JQ(location).attr('pathname');
    return this.pattern.test(pathname);
};
PageHandler.prototype.init = function() {
    this.init_func();
};


// Deck
var Deck = new PageHandler(/^\/zh\/character\/deck/, function(){
    var do_with_all_card = function(func){
        var count_button = JQ(".dataview .dataview-footbar .dataview-count-enabled");
        var current_count = count_button.text();
        count_button.text("10000");
        count_button.attr("data-count", "10000");
        count_button.click();
        func();
        count_button.text(current_count);
        count_button.attr("data-count", current_count);
        count_button.click();
        JQ('html, body').animate({
            scrollTop: JQ(".deck-floater .s-title").offset().top
        }, 0);
        //window.scrollTo(0, 0);
    };

    var extra_gear_init = function(){
        JQ(".deck-floater").append(JQ("<div><textarea id='estiah2-script-deck-textarea'></textarea><button id='estiah2-script-deck-export'>导出</button><button id='estiah2-script-deck-import'>导入</button><span id='estiah2-script-deck-info'></span></div>"));

        JQ("#estiah2-script-deck-export").click(function(){
            JQ("#estiah2-script-deck-info").text("正在导出");

            var scard_list = [];
            JQ(".deck-floater .deck-scards .scard").each(function(index, element){
                scard_list.push(JQ(element).attr("data-id"));
            });

            var card_list = {};
            JQ(".deck-floater .deck-cards .card").each(function(index, element){
                var card_id = JQ(element).attr("data-id");
                var card_count = JQ(element).find(".count").text();
                card_list[card_id] = card_count;
            });

            var deck_text = JSON.stringify({"scards": scard_list, "cards": card_list});

            JQ("#estiah2-script-deck-textarea").val(deck_text);

            JQ("#estiah2-script-deck-info").text("导出成功");
        });

        JQ("#estiah2-script-deck-import").click(function(){
            JQ("#estiah2-script-deck-info").text("正在导入");

            JQ(".deck-floater .deck-clear").click();

            var deck_text = JQ("#estiah2-script-deck-textarea").val().trim();
            var deck;
            try {
                deck = JSON.parse(deck_text);
            } catch (e) {
                JQ("#estiah2-script-deck-info").text("装备解析错误");
            }

            do_with_all_card(function(){
                var scard_list = deck["scards"];
                if(!function(){
                    for (var i in scard_list) {
                        var scard = scard_list[i];
                        var found = false;
                        var element = JQ(".dataview .dataview-content .scard[data-id='" + scard + "']");
                        if (element.length) {
                            element.find(".add-scard").click();
                            found = true;
                        }
                        if (!found) {
                            JQ("#estiah2-script-deck-info").text("资源" + scard + "没找到");
                            return false;
                        }
                    }
                    return true;
                }()) {
                    return;
                }

                var card_list = deck["cards"];
                if(!function(){
                    for (var card in card_list) {
                        var count = card_list[card];
                        var found = false;
                        var element = JQ(".dataview .dataview-content .card[data-id='" + card + "']");
                        if (element.length) {
                            var max_count = element.find(".count").text().slice(-1);
                            if (parseInt(count) > parseInt(max_count)) {
                                JQ("#estiah2-script-deck-info").text("卡" + card + "超过上限");
                                return false;
                            } else {
                                for (var j = parseInt(count); j > 0; j--){
                                    element.find(".add-card").click();
                                }
                                found = true;
                            }
                        }
                        if (!found) {
                            JQ("#estiah2-script-deck-info").text("卡" + card + "没找到");
                            return false;
                        }
                    }
                    return true;
                }()) {
                    return;
                }
            });
            JQ("#estiah2-script-deck-info").text("导入成功");
        });
    };

    extra_gear_init();
});

// function list
var function_list = [Deck];


JQ(document).ready(function(){
    for (var i in function_list) {
        var f = function_list[i]
        if (f.match()) {
            f.init();
        }
    }
});
