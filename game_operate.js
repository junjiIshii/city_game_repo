//資源インスタンス

const people = new Resource('労働者',0,'fas fa-user-friends');
const food = new Resource('食料',0,'fas fa-apple-alt');
const product = new Resource('生産力',0,'fas fa-hammer');
const money = new Resource('資金',0,'fas fa-money-bill-wave');
const anger = new Resource('不満',0,'fas fa-angry');
const happiness = new Resource('幸福度',0,'fas fa-smile');

var resourceData = [people,food,product,money,anger];

//建物インスタンス
const residens = new Building('住居',1,0,0,10,0,'pictures/town.png',1,0,0);
const store = new StoreBuilding('商業区',1,1,1,5,2,'pictures/middle-store.png',1,0,0,1.0);
const factory = new Building('工場',1,1,1,10,2,'pictures/middle_factory.png',1,0,0);
const farm = new Building('農場',1,1,1,2,1,'pictures/farm.png',1,0,0);
const port = new PortBuilding('商用港',1,1,0,10,3,'pictures/port.png',0,120,80,0.5,1.5,5);
const powerPlant = new SupportBuilding('発電所',1,1,0,2,2,'pictures/power_plant.png',0,70,50,5);
const granary = new SupportBuilding('穀物庫',1,1,0,1,1,'pictures/granary.png',0,60,60,5);
const bank = new SupportBuilding('銀行',1,1,0,2,2,'pictures/bank.png',0,50,70,5);
const hospital = new WealthBuilding('福祉施設',1,1,0,2,1,'pictures/hospital.png',0,50,30,5);



var cellData = [];
cellData[1]= new Cell(1,residens,81);
cellData[2]= new Cell(2,store,87);
cellData[3]= new Cell(3,factory,69);
cellData[4]= new Cell(4,farm,65);
cellData[5]= new Cell(5,port,83);
cellData[6]= new Cell(6,powerPlant,68);
cellData[7]= new Cell(7,granary,90);
cellData[8]= new Cell(8,bank,88);
cellData[9]= new Cell(9,hospital,67);

//初期設定
//ここはクロージャでかけるかも！
const happinesHandi = 50;
var cheat_flg = false;
var tutorialMode = false;
var start_flg = false;
var term = 1;
function inti(){
    
    start_flg = true;
    $('.playwrapper').css({'display':'inline-block'});
    $('.gameOver').css({'display':'none'});

    term = 1;
    people.setValue(10);
    food.setValue(50);
    product.setValue(10);
    money.setValue(20);//20
    anger.setValue(0);

    showResData();
    $('.start-menu').css({'display':'none'});
    $('#term').children('h4').text(term);
    history('ゲームスタート！',2);
    history(term+'ターン目',1);

}

function debugCheat(){
    if(cheat_flg){
        food.setValue(50000);
        product.setValue(50000);
        money.setValue(50000);
        //anger.setValue(60);
    }

}

function gameOver(){
    if(anger.saving>=100){
        $('.building-unit').css({'display':'none'});
        $('.gameOver').css({'display':'inline-block'});
        $('.buildInfo').css({'display':'none'});
        $(".next-btn").off('click');
    }
}

//===========
//ターンイベント
//===========
function autoInc(){
    if(term%10==0){
        people.makethis((term/10)*2);
        history('人口が自然増加しました！(人口＋'+((term/10)*2)+')',1);
    }
}

//悪いイベントの発生率ががターンを進むごとに0.01増える。最大10%
function termRaise(start){
    if(term >= start){
        var raise =  0.01*(term-start)

        if(raise >= 10){
            return 10;
        }else{
            return raise;
        }
        
    }else{
        return 0;
    }
}

//幸福度の下げ幅に応じて不幸イベントが発生しやすくなる。
function unhappryRise(){
    if(happiness.saving <0){
        var rise = happiness.saving;//幸福度が負の値の時

        if(-90 <= rise && rise <0){
            return rise*-1; //発生確率をあげる
        }else if(rise <-90){
            return 90;
        }
    }else if(happiness.saving >0){
        return -1*Math.floor(rise/10);
    }
}

//0.5%の確率で人口が2倍になる
function babyBoom(){
if(randomSet(0.1,150,0)){
    people.saving *=2;
    history('爆発的ベビーブーム発生！！人口が２倍になってしまった！！',3);
}
}

//食料が９割消える
function bagsPanic(){
    if(randomSet(3,150,0)){
        food.saving = Math.floor(food.saving*0.1);
        history('バッタの大量発生により9割の食料が食い尽くされてしまった！',3);
    }
}

//資金が９割消える
function moneyCrisis(){
    if(randomSet(3,150,0)){
        money.saving = Math.floor(money.saving*0.1);
        history('経済危機が発生！対処のために9割の資金が歳出されてしまった！',3);
    }
}

//住宅を除く任意の建物の食料消費を１増加
function foodConsUp(){
    var x = Math.floor(Math.random()*8+2);
    var selected = cellData[x];

    if(selected.building.avail !=0 && randomSet(2,150)){
        selected.building.foodComsume +=1;
        history('労働者のデモによって'+selected.building.name+'の食料消費が1増加しました！',3);
    }
}


//福祉施設の資金を１増加
function hopitalBudgetUp(){
    if(hospital.avail !=0 && randomSet(3,150)){
        hospital.budget +=1;
        history('労働者のデモによって福祉施設の必要資金が1増加しました！',3);
    }
}


//災害によって病院と住居以外の一つの建物の使用を不可能にする

function accident(){


        cellData.forEach(val => {
            //先ずは直せる建物があるかを確認する。
            if(val.building.accident_flg && val.building.unavail+4<term){
                val.building.repaired()
                val.building.unavail = 0;
            }

        })
    
        var x = Math.floor(Math.random()*7+2);//災害で破壊させる建物
        var y = Math.floor(Math.random()*7+2);//ストライキを起こさせる建物

        var selectedX = cellData[x];
        var selectedY = cellData[y];
    
        if(!selectedX.building.accident_flg && selectedX.building.unavail == 0){
        
            if(selectedX.building.avail !=0 && randomSet(2,150,0)){ 
                selectedX.building.workOut();
                selectedX.building.unavail = term;
            }
        }


        if(!selectedY.building.accident_flg && selectedY.building.unavail == 0){
        
            if(selectedY.building.avail !=0 && randomSet(0,0)){ 
                
                selectedY.building.strikeOut();
                selectedY.building.unavail = term;
            }
        }
    
    
}


//売値、買値の変動（5ターンごと）
var pastSell = port.sellraito;
var pastBuy = port.buyraito;
function sellRaitoChange(){
    if(port.avail != 0 && term%5 == 0){
        port.sellraito = (Math.random()*(1.0 - 0.01)+0.01).toFixed(2);
        port.buyraito = (Math.random()*(3.0 - 0.50)+0.50).toFixed(2);

        if(port.sellraito > pastSell){
            history('売却価格が上昇しました!（'+pastSell+'→'+port.sellraito+'）',2);
        }else if(port.sellraito == pastSell){
            history('売却価格は変化しませんでした。',2);
        }else{
            history('売却価格が下落しました!（'+pastSell+'→'+port.sellraito+'）',3);
        }


        if(port.buyraito > pastBuy){
            history('購入価格が上昇しました!（'+pastBuy+'→'+port.buyraito+'）',3);
        }else if(port.buyraito == pastBuy){
            history('売却価格は変化しませんでした。',2);
        }else{
            history('購入価格が下落しました!（'+pastBuy+'→'+port.buyraito+'）',2);
        }

        pastSell = port.sellraito; //新しい値に更新
        pastBuy = port.buyraito; //新しい値に更新
        port.showBuldInfo();
    }
}

//ターンイベントを起こす
function termEvent(){
    oneTimeMes();
    babyBoom();
    bagsPanic();
    sellRaitoChange();
    foodConsUp();
    hopitalBudgetUp();
    moneyCrisis()
    accident();
}


//===========
//===========


//ワンタイムメッセージ
var pandemic_flg = true;
var notify_hospital = true;

//特定のタイミングでのワンタイムメッセージ
function oneTimeMes(){

    if(people.saving>=50 && pandemic_flg){
        history('人口増加によって国民全体が不満を抱いている。福祉施設に投資して不満を解消しよう。',3);
        pandemic_flg = false;
    }

    if(people.saving>15 && notify_hospital){
        history('人口が50を越えると福祉による不満が発生します。早めに福祉施設を建てておくといいです。',1);
        notify_hospital = false;
    }
}


//仕事をしていない労働者を計算する。
function getFreePeople(){

    var freePeople = people.saving;
    cellData.forEach(val => {
        if(val.building.avail !=0){
            freePeople -= val.building.worker;
        }
    });

    //console.log(freePeople);
    return freePeople;
}

//任意の確率を生成
function randomSet(defaultPer,term,unhappy=unhappryRise()){
    var all = defaultPer + termRaise(term) + unhappy;
    
    if(all>100){
        all = 99;
    }else if(all <0){
        all = 0
    }

    var x = Math.random();

    if(x<all/100){
        return true;
    }else{
        return false;
    }
}

//資源バーの表示を更新する。（主にターン内での行動による値変化）
function showResData(){
    $('#people-info').children('p').text(getFreePeople()+"/"+people.saving);
    $('#food-info').children('p').text(food.saving+"("+liveFoodCons()+")");
    $('#product-info').children('p').text(product.saving+"/"+store.worker+"(次:"+liveProdMake()+")");
    $('#money-info').children('p').text(money.saving+"("+liveMoneyget()+")");
    $('#anger-info').children('p').text(anger.saving);
    $('#infectRisk-info').children('p').text(livehappinessget());
}


//次のターンに行く時の、食料消費や各建物の生産物を計算する。
function goNext(){
    
    cellData.forEach(val => {
        var bld = val.building;
        if(bld.avail !=0){
            bld.productMake();
            bld.foodConsumeVal();
        }
    });

    //フリーな労働者の分の食料消費を引く
    food.usethis(getFreePeople());
    port.resethandle();


}


//メッセージ生成関数
var mesCount = 1;
var lastMes = 1
function history(mes,style=0){

    var clasName = "newMes"+" mes"+mesCount;
    $('.message-area-wrapper').append('<p class="'+clasName+'">'+mes+'</p>');
    
    switch(style){
        case 1:
            $('.mes'+mesCount).css({"font-weight":"bold"});
            break;

        case 2:
            $('.mes'+mesCount).css({"font-weight":"bold" ,"color":"green"});
            break;

        case 3:
            $('.mes'+mesCount).css({"font-weight":"bold" ,"color":"red"});
            break;
    }

    mesCount += 1;

    //新しいメッセージが追加した時にメッセージエリアを自動スクロール
    var mesArea = $('.message-area');
    mesArea.scrollTop($('.message-area-wrapper').innerHeight());
}



//次のターンの食料増減を表示
function liveFoodCons(){
    var foodUsed=0;
    cellData.forEach(val => {
        var bld = val.building;
        
        if(bld.avail !=0){
            foodUsed += bld.foodComsume*bld.worker;
        }
        });
    foodUsed += getFreePeople();
    //ここに効率の影響を入れておく
    var foodsupply = Math.floor(farm.worker*farm.prodPerWorker*(1+granary.support/100));
    var result = foodsupply-foodUsed;

    if(result<0){
        return result;
    }else{
        return '+'+result;
    }
}

//次のターンの生産力を表示
function liveProdMake(){
    var productMake = 0;
    productMake = Math.floor(factory.worker*factory.prodPerWorker*(1+powerPlant.support/100));
    return productMake;
}

//次のターンの資金を表示
function liveMoneyget(){
    var moneyMake = 0;
    var moneyMake = Math.floor(store.worker*store.raito*(1+bank.support/100)-(hospital.worker*hospital.budget));
    //var medicBill = hospital.woker*hospital.budget;
    

    if(moneyMake<0){
        return moneyMake;
    }else{
        return '+'+moneyMake;
    }
}

//リスクの値を表示
function livehappinessget(){
    if(people.saving<=happinesHandi){
        return 0+'(+'+0+')';
    }else{
        var supply = (hospital.worker*hospital.raito) - people.saving
        var repaire = Math.floor(supply/people.saving);

        if(repaire>=0){
            return supply +'(+'+repaire+')';
        }else{
            return supply +'(+'+0+')';
        }
    }
    
}


//イベント
$(".stat-btn").on('click',function(){
    inti();
    //shortCutBld();
});
$(".next-btn").on('click',showNext);
$(".reset-btn").on('dblclick',function(){
    location.reload()
});

$(".gameOver-btn").on('click',function(){
    location.reload()
});


//ショートカットキー
//うまくクラスを使ってスマートにできないか？
shortCutBld();
function shortCutBld(){
    $(document).on('keyup',function(event){

        var pushedKey = event.which;

        switch(pushedKey){
            case 81:
                residens.showBuldInfo();
                break;

            case 87:
                store.showBuldInfo();
                break;

            case 69: 
                factory.showBuldInfo();
                break;

            case 65:
                farm.showBuldInfo();
                break;

            case 83:
                port.showBuldInfo();
                break;

            case 68:
                powerPlant.showBuldInfo();
                break;

            case 90:
                granary.showBuldInfo();
                break;

            case 88:
                bank.showBuldInfo();
                break;

            case 67:
                hospital.showBuldInfo();
                break;

            case 32:
                showNext();
                break;
        }
    
    })
}

function shortCutWoker(key,bld){
    if(key === 73){
        bld.incWoker();
    }

    if(key === 79){
        bld.decWoker();
    }
}

clickBuildings();
function clickBuildings(){
    $('.building-unit').on('click',function(){
        $selected = $(this).attr('id');
        clickOperate($selected)
    })
}

function clickOperate($obj){
    $('.fa-plus-circle').off('click');
    $('.fa-minus-circle').off('click');
    $('.fa-arrow-circle-up').off('click');
    $('.fa-arrow-alt-circle-up').off('click');
    $('#unlock-btn').off('click');
    $('.foodSellNum').off('keyup');
    $('.productSellNum').off('keyup');
    $('.foodBuyNum').off('keyup');
    $('.productBuyNum').off('keyup');
    


    Number($obj);
    var hasBuild = cellData[Number($obj)].building;
    $('.buildInfo').css({'display':'block'});

    $('.game-setting-area').data('showing',$obj);

    hasBuild.htmlConvert();
    hasBuild.showBuldInfo();

    $('.fa-plus-circle').on('click',function(){
        hasBuild.incWoker();
        hasBuild.showBuldInfo();
        showResData();
    })

    $('.fa-minus-circle').on('click',function(){
        hasBuild.decWoker();
        hasBuild.showBuldInfo();
        showResData();
    })

    $('.fa-arrow-circle-up').on('click',function(){
        hasBuild.sizeUp();
        hasBuild.showBuldInfo();
        showResData();
    })

    $('.fa-arrow-alt-circle-up').on('click',function(){
        hasBuild.efficiUp();
        hasBuild.showBuldInfo();
        showResData();
    })

    $('#unlock-btn').on('click',function(){
        //console.log('pushrd')
        hasBuild.unlockBld(Number($selected));
        hasBuild.showBuldInfo();
        showResData();
    })



    sellFood(hasBuild,food,'.foodSellNum','.sellFood-btn');
    sellProd(hasBuild,product,'.productSellNum','.sellProduct-btn');
    buyfood(hasBuild,food,'.foodBuyNum','.BuyFood-btn');
    buyProd(hasBuild,product,'.productBuyNum','.BuyProduct-btn');
}

    function showNext(){
        //removeMinusはマイナスを0に変えるか、0以上なら普通に残数を表示する(お金を除く)。
        //建物の計算処理と不満判定
        
        goNext();
        anger.getAnger();
        termEvent();
        debugCheat();
        gameOver();

        //イベント
        autoInc();


        if($('.game-setting-area').data('showing')){
            var seeing = cellData[$('.game-setting-area').data('showing')];
            seeing.building.liveNeedRes();
            seeing.building.showBuldInfo();
        }

        
        $('#people-info').children('p').text(getFreePeople()+"/"+people.saving);
        $('#food-info').children('p').text(food.removeMinus()+"("+liveFoodCons()+")");
        $('#product-info').children('p').text(product.removeMinus()+"/"+store.worker+"(次:"+liveProdMake()+")");
        $('#money-info').children('p').text(money.saving+"("+liveMoneyget()+")");
        $('#anger-info').children('p').text(anger.removeMinus());
        $('#infectRisk-info').children('p').text(livehappinessget());
        term += 1;
        $('#term').children('h4').text(term);
        
        history('=================',0);
        history(term+'ターン目',1);
    }

function sellFood(inst,prop,inputClass,btnClass){

    $(inputClass).on('keyup',function(){
        
        setTimeout(function(){
            
            //小数点を排除する
            var $num = Math.floor($(inputClass).val());
            $(inputClass).val($num);
        
            
            if(!isNaN($num)){
                $(btnClass).off('click');
                            
                inst.sellFood = $num;
                inst.showBuldInfo();

                $(btnClass).on('click',function(){
                    if(0 < $num && $num <= food.saving){
                        inst.sellthis(prop);
                        showResData();
                        inst.showBuldInfo();
                    }else if($num > food.saving){
                        history('売却量が備蓄量を超えています。',3);
                    }else{
                        history('０、負の数は扱えません',3);
                    }
                })
                
            }
        },700)
        })
}

function sellProd(inst,prop,inputClass,btnClass){
    $('.productSellNum').on('keyup',function(){
        
        setTimeout(function(){
            
            //小数点を排除する
            var $num = Math.floor($(inputClass).val());
            $(inputClass).val($num);
        
            
            if(!isNaN($num)){
                $(btnClass).off('click');
                    
                    inst.sellProd = $num;
                    inst.showBuldInfo();

                    $(btnClass).on('click',function(){
                        if(0 < $num && $num <= product.saving){
                            inst.sellthis(prop);
                            showResData();
                            inst.showBuldInfo();
                        }else if($num > product.saving){
                            history('売却量が備蓄量を超えています。',3);
                        }else{
                            history('０、負の数は扱えません',3);
                        }
                    })
                    
            }
        },700)
    })
}

function buyfood(inst,prop,inputClass,btnClass){
    
    $(inputClass).on('keyup',function(){
        setTimeout(function(){
            //小数点を排除する
            var $num = Math.floor($(inputClass).val());
            $(inputClass).val($num);
        
            if(!isNaN($num)){
                $(btnClass).off('click');
                    
                    inst.buyFood = $num;
                    inst.showBuldInfo();

                    $(btnClass).on('click',function(){
                        if(0 < $num && $num <= money.saving){
                            inst.buythis(prop);
                            showResData();
                            inst.showBuldInfo();
                        }else if($num > money.saving){
                            history('購入に必要な資金が足りません。',3);
                        }else{
                            history('０、負の数は扱えません',3);
                        }

                    })
                    inst.showBuldInfo();
            }
        }, 800);
    })
    
}

function buyProd(inst,prop,inputClass,btnClass){
    
    $(inputClass).on('keyup',function(){
        setTimeout(function(){
            //小数点を排除する
            var $num = Math.floor($(inputClass).val());
            $(inputClass).val($num);
        
            if(!isNaN($num)){
                $(btnClass).off('click');
                    
                    inst.buyProd = $num;
                    inst.showBuldInfo();

                    $(btnClass).on('click',function(){
                        if(0 < $num && $num <= money.saving){
                            inst.buythis(prop);
                            showResData();
                            inst.showBuldInfo();
                        }else if($num > money.saving){
                            history('購入に必要な資金が足りません。',3);
                        }else{
                            history('０、負の数は扱えません',3);
                        }

                    })
                    inst.showBuldInfo();
            }
        }, 800);
    })
    
}