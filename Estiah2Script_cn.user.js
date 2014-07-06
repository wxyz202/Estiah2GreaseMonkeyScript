// ==UserScript==
// @name        Estiah2Script_cn
// @namespace   https://github.com/wxyz202
// @description the greasemonkey script for estiah2
// @include     http://cn.estiah2.com/zh/*
// @version     0.1
// @grant       none
// @require     http://code.jquery.com/jquery-1.11.0.min.js
// ==/UserScript==

var JQ = jQuery.noConflict();


init_deck = function(){
    JQ(".deck-floater").append(JQ("<div><textarea id='estiah2-script-deck-textarea'></textarea><button id='estiah2-script-deck-export'>导出</button><button id='estiah2-script-deck-import'>导入</button><span id='estiah2-script-deck-info'></span></div>"));
    var count100 = JQ(".dataview .dataview-footbar .dataview-count[data-count='100']");
    count100.text("10000")
    count100.attr("data-count", "10000");
    count100.click();
    window.scrollTo(0, 0);

    JQ("#estiah2-script-deck-export").click(function(){
        JQ("#estiah2-script-deck-info").text("正在导出");

        var scard_list = [];
        JQ(".deck-floater .deck-scards .scard").each(function(index, element){
            scard_list.push(JQ(element).attr("data-id"));
        });
        var scard_text = scard_list.join(",");

        var card_list = [];
        JQ(".deck-floater .deck-cards .card").each(function(index, element){
            var card_id = JQ(element).attr("data-id");
            var card_count = JQ(element).find(".count").text();
            card_list.push(card_id + "x" + card_count);
        });
        var card_text = card_list.join(",");

        JQ("#estiah2-script-deck-textarea").val(scard_text + "|" + card_text);

        JQ("#estiah2-script-deck-info").text("导出成功");
    });

    JQ("#estiah2-script-deck-import").click(function(){
        JQ("#estiah2-script-deck-info").text("正在导入");

        JQ(".deck-floater .deck-clear").click();

        var deck_text = JQ("#estiah2-script-deck-textarea").val().trim();
        if (/^(\d+(,\d+)*)\|(\d+x\d(,\d+x\d)*)$/.test(deck_text)) {
            var scard_text = deck_text.split("|")[0];
            var scard_list = scard_text.split(",");
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

            var card_text = deck_text.split("|")[1];
            var card_list = card_text.split(",");
            if(!function(){
                for (var i in card_list) {
                    var card = card_list[i].split("x")[0];
                    var count = card_list[i].split("x")[1];
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
            JQ("#estiah2-script-deck-info").text("导入成功");
        } else {
            JQ("#estiah2-script-deck-info").text("装备解析错误");
        }
    });
};


JQ(document).ready(function(){
    var path_name = JQ(location).attr('pathname');
    if (/^\/zh\/character\/deck/.test(path_name)) {
        init_deck();
    }
});
