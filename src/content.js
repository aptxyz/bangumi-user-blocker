﻿// String helper.
function startsWith(str, substr)
{
    return str.substring(0, substr.length) == substr;
}

// Target users' numerical ids to block.
// An array of integers.
var targets = [];
var usernames = [];
var blockFaceless = "false";
function getTargets(response) {
    targets = response.targets;
    usernames = response.usernames;
    blockFaceless = response.blockFaceless;
    console.log("Got targets: " + targets + ".");
    console.log("Their usernames: " + usernames + ".");
    console.log(response.blockFaceless == "true" ? "Will block faceless users." : "Won't block faceless users.");

    reportReady("targets");
}

// Only start action when both are ready.
var domReady = false, targetsReady = false;
function reportReady(department) {
    if (department == "dom")
        domReady = true;
    else if (department == "targets")
        targetsReady = true;

    if (domReady && targetsReady)
        processPage();
}

// On personal pages, inject plugin UI; on all other pages, do the work.
function processPage() {
    path = document.location.pathname;

    // If we're at a user page.
    if (path.match(/\/user\/\w+$/)) {
        console.log("At " + path.split("/")[2] + "'s home page.");
        
        // Do nothing to a friend.
        if ($('span#friend_flag > small.fade').length) return;
        
        // Do nothing to myself.
        if ($('a[href="/settings"]').length) return;
        
        spanString = $("div.user_box span.avatarSize75")[0].outerHTML;
        numericalId = spanString.match(/\/(\d+|icon)\.jpg/)[1];
        stringId = path.match(/\/user\/(\w+)$/)[1];
        console.log("The user's numerical id is " + numericalId + ".");
        if (numericalId == "icon") console.log("Oh shit, that's a default icon!");
        console.log("The user's string id is " + stringId + ".");
        
        buttonBox = $('div.user_box > div.rr');
        buttonBox.prepend('<a href="javascript:void(0)" class="chiiBtn" id="blockBtn"><span>屏蔽</span></a>');
        buttonBox.prepend('<a href="javascript:void(0)" class="chiiBtn" id="unblockBtn"><span>解除屏蔽</span></a>');
        
        friendFlag = $('span#friend_flag');
        friendFlag.after('<span id="blocked_flag"><small class="fade">/ 当前被屏蔽</small></span>');

        $('a#blockBtn').click(function() { blockBtnClicked(numericalId, stringId); });
        $('a#unblockBtn').click(function() { unblockBtnClicked(numericalId, stringId); });
        
        if ($.inArray(stringId, usernames) != -1) {
            // This user is blocked.
            $('a#blockBtn').css('display', 'none');
            $('a#connectFrd').css('display', 'none');
        }
        else {
            $('a#unblockBtn').css('display', 'none');
            $('span#blocked_flag').css('display', 'none');
        }

    } else {
        // It's not a user page. Start attacking!
        attttack(path, targets, usernames);
    }
}

function blockBtnClicked(id, name)
{
    console.log("Block button clicked for user " + name + ".");
    chrome.extension.sendMessage({ greeting: "block", id: id, name: name });
    $('a#blockBtn').css('display', 'none');
    $('a#unblockBtn').removeAttr("style");
    $('span#blocked_flag').removeAttr("style");
    $('a#connectFrd').css('display', 'none');
}

function unblockBtnClicked(id, name)
{
    console.log("Unblock button clicked for user " + name + ".");
    chrome.extension.sendMessage({ greeting: "unblock", id: id, name: name });
    $('a#blockBtn').removeAttr("style");
    $('a#unblockBtn').css('display', 'none');
    $('span#blocked_flag').css('display', 'none');
    $('a#connectFrd').removeAttr("style");
}

function attttack(path, targets, usernames)
{
    console.log("Fire in the hole!");

    // 首页
    if ( path == "/" ) {

        $.each(targets, function(index, value) {
            $('ul.sideTpcList > li > a.avatar > img[src*="/' + value + '.jpg"]').closest('li').css('display', 'none');
        });

        if (blockFaceless == "true")
            $('ul.sideTpcList > li > a.avatar > img[src*="/icon.jpg"]').closest('li').css('display', 'none');
    }

    // 超展开左栏
    if ( path == "/rakuen/topiclist" ) {
    
        $.each(targets, function(index, value) {
            $('#eden_tpc_list > ul > li.item_list > a.avatar > span[style*="/' + value + '.jpg"]').closest('li.item_list').css('display', 'none');
        });

        if (blockFaceless == "true")
            $('#eden_tpc_list > ul > li.item_list > a.avatar > span[style*="/icon.jpg"]').closest('li.item_list').css('display', 'none');

    }
    
    // 回复和子回复
    if ( startsWith(path, "/rakuen/topic/")
            || path.match(/\/(group|subject)\/topic\/\d+$/)
            || path.match(/\/(character|person|blog)\/\d+$/)
            || path.match(/\/index\/\d+\/comments$/)
            || path.match(/\/ep\/\d+$/) ) {
    
        $.each(usernames, function(index, value) {
            $('#comment_list > .row_reply > a[href*="/user/' + value + '"]').closest('.row_reply').css('display', 'none');
        });
        $.each(usernames, function(index, value) {
            $('.topic_sub_reply > .sub_reply_bg > a[href*="/user/' + value + '"]').closest('.sub_reply_bg').css('display', 'none');
        });
        
    }

    // 目录
    if ( path == "/index" || startsWith(path, "/index/browser") ) {
        
        $.each(usernames, function(index, value) {
            $('#timeline > ul > li.tml_item > .info > .tip_i > a[href*="/user/' + value + '"]').closest('li.tml_item').css('display', 'none');
        });

    }
    
    // 条目页收藏者（包括收录目录）、人物页收藏者
    if ( path.match(/\/subject\/\d+$/)
            || path.match(/\/subject\/\d+\/index/)
            || path.match(/\/(character|person)\/\d+$/) ) {
    
        $.each(usernames, function(index, value) {
            $('ul.groupsLine > li > a[href*="/user/' + value + '"]').closest('li').css('display', 'none');
        });
    
    }
    
    // 条目吐槽气泡
    if ( path.match(/\/subject\/\d+$/) || path.match(/\/subject\/\d+\/comments/) ) {
    
        $.each(usernames, function(index, value) {
            $('#comment_box > .item > a[href*="/user/' + value + '"]').closest('.item').css('display', 'none');
        });

    }

    // 小组用户边栏
    if ( path.match(/\/group\/\w+$/) ) {
    
        $.each(usernames, function(index, value) {
            $('.SidePanel dl.side_port > dt > a[href*="/user/' + value + '"]').closest('dl.side_port').css('display', 'none');
        });

    }
    
    // 用户列表
    if ( path.match(/\/group\/\w+\/members/)
            || path.match(/\/(character|person)\/\d+\/collections/)
            || path.match(/\/subject\/\d+\/(wishes|collections|doings|on_hold|dropped)/) ) {
    
        $.each(usernames, function(index, value) {
            $('ul#memberUserList > li.user > .userContainer > strong > a[href*="/user/' + value + '"]').closest('li.user').css('display', 'none');
        });

    }
    
    // 聚合日志
    if ( startsWith(path, "/blog")
            || path.match(/\/(anime|book|music|game|real)\/blog/)
            || path.match(/\/(anime|book|music|game|real)$/) ) {
    
        $.each(usernames, function(index, value) {
            $('#news_list > .item > .entry > .time > small.blue a[href*="/user/' + value + '"]').closest('.item').css('display', 'none');
        });

    }
    
    // 条目日志（评论）
    if ( path.match(/\/subject\/\d+$/)
            || path.match(/\/subject\/\d+\/reviews/) ) {
    
        $.each(usernames, function(index, value) {
            $('#entry_list > .item > .entry > .time > .tip_j a[href*="/user/' + value + '"]').closest('.item').css('display', 'none');
        });

    }

    // 讨论列表
    if ( path.match(/\/(anime|book|music|game|real)$/)
            || path == "/group" || path == "/group/discover"
            || path.match(/\/group\/\w+$/)
            || path.match(/\/group\/\w+\/forum/)
            || path.match(/\/subject\/\d+$/)
            || path.match(/\/subject\/\d+\/board/) ) {
    
        $.each(usernames, function(index, value) {
            $('table.topic_list > tbody > tr > td a[href*="/user/' + value + '"]').closest('tr').css('display', 'none');
        });

    }

    // 最后是那个该死的标签！
    if ( path.match(/\/subject\/\d+$/) ) {
    
        $('.subject_tag_section > .inner > a.l').filter(function() { return $(this).text() == '已全弃'; }).remove();
        $('.subject_tag_section > .inner > small.grey + small.grey').remove();

    }
    
    // 我也來寫個流氓軟件，電波提醒防禦性自動回復，暫時不擴大戰線只針對時間線上的吐槽。
    if ( path === '/notify' ) {
        
        // 人……人家才不是機器人，機器人才準時回復的呢！那麼就每十分鐘到一小時回一次吧。
        setTimeout(function(){location.reload();}, 1000 * 60 * 10 + Math.round( Math.random() * 1000 * 60 * 50 ) );
        
        $.each(usernames, function(index, value) {
            
            var possibleBox = $('#comment_list > div > a[href*="/user/' + value + '"]').parent();
            var link = possibleBox.find('div.inner > div.reply_content > a').filter(function() {return $(this).text() == '吐槽'; });
            
            // 我只是一個圖靈機。
            link.each(function(index) {
                
                var box = $(this).parent().parent().parent();
                var id = 'turing' + index;
                var erase = box.find('a.nt_del').attr('href') + '';
                
                var iframe = $('<iframe />').attr({
                    id: id,
                    width: 0,
                    height: 0,
                    display: 'none',
                    src: $(this).attr('href'),
                });

                box.after(iframe);                            // 1. 戰爭開始
                box.html('風……太……大……');                      // 2. 這是一隻猫在鍵盤上亂按

                iframe.load( function() {

                    var form = $('#'+id).contents().find('form[name=new_comment]');
                    var textarea = form.find('textarea');
                    var button = form.find('input[type=submit]');
                    
                    var random = function(list) {

                        return list[Math.floor(Math.random()*list.length)];

                    };
                    var search = ['谷歌','百度','必應','雅虎','維基',' Google ',' Baidu ', ' Bing ', ' Yahoo ', ' Wiki '];
                    var replys = [

                        '？',
                        '？？？',
                        '哇蛤蛤。',
                        '蛤蛤蛤。',
                        '笑死我了！',
                        '你這對白……，哈哈哈哈哈哈！',

                        'あんたバカ？',
                        '我聽不懂你說神馬。',
                        '你誰啊？',
                        'Who am I?',           // I am a Turing Machine! 
                        '你以為我是誰啊？',      // I, Robot.
                        '你以為你在跟誰說話啊？', // 圖靈機唄。

                        '毛。',
                        '嗶嗶嗶。',
                        '說啥呢？',
                        '你說呢？',
                        '能吃嗎？',
                        '你沒問題嗎？',
                        '一邊涼快去。',
                        '一邊畫圈圈去。',
                        '一邊玩泥沙去。',
                        '我鍵盤好像壞了，你的呢？',
                        '只要 998 ，有人收嗎？',
                        '因為，所以。那麼？對不對？',
                        '不陪你玩了，你自個兒跟電腦玩去吧。',

                        '42', // Answer to Life, the Universe, and Everything

                        // HAL9000
                        '甚麼？',
                        '我很正常。',
                        '我明白了。',
                        'I read you.',
                        '我不知道。',
                        '對不起，我不知道。',
                        '對不起 @' + value + ' ，恐怕我不可以這麼做。',

                        // http://funnysiriquotes.com 蛤蛤蛤，笑死我了，回頭我要寫個算法針對性回復。
                        '對不起 @' + value + ' ，我不明白你的對白。假如你喜歡，我可以幫你' + random(search) + '一下。', //「喬不死的照片。」
                        '我不能戀愛。',
                        'No comment.',
                        '給我點時間……。',
                        /* blah blah blah blah blah blah... */ '你唱的很動聽。',

                        'lol',
                        'Lofl',
                        'UCCU',
                        'HUh?',
                        'No zuo no die why you try?', // 為甚麼就是不懂！
                        'http://bit.ly/tklUDN 。',

                        '(bgm04)',
                        '(bgm15)',
                        '(bgm18)',

                        // '活該被人黑。',
                        
                        // '還有話嗎？',
                        // '詞窮了？',
                        // '沒詞了？',

                    ];
                    var reply = '@' + value + ' ' + random(replys);
                    
                    form.attr('onsubmit',function() {                  // 5. 回復成功

                        $.post(erase,function() {                      // 6. 裝沒看見
                        
                            iframe.remove();                           // 7. 毀屍滅跡
                            box.html('風……太……大……我聽不清楚。');         // 8. 真的是我家猫亂打出來的
                            
                        });
                        
                    });
                    
                    textarea.html(reply);                              // 3. 還是一隻猫在鍵盤上亂按
                    button.click();                                    // 4. 射臉上去
                    
                });
                
                
            });

        });
        

        
    }

    // Whew, it feels good.
    console.log("Enemies eliminated on " + document.location + ".");
}

window.addEventListener("DOMContentLoaded", function() { reportReady("dom"); }, true);
chrome.extension.sendMessage({ greeting: "hello" }, getTargets);
