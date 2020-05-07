class Cell{
    constructor(cellId,building,key){
        this.cellId = cellId;
        this.building = building;
        this.shortCutKey = key;
    }

}

//食料、資金などのクラス。
class Resource{
    constructor(name,saving,iconClass){
        this.name = name;               //資源の名前
        this.saving = saving;           //今持っている資源の量。このプロパティで主にゲームが進む
        this.iconClass = iconClass;     //fontawesomeのアイコンを指定するクラス
    }

    //savingを任意の値に設定する。
    //工場で作られる生産力はここで設定（作ら）される。また発電所の補正もここでかける。
    setValue($num){

        switch(this){
            case product:
                this.saving =Math.floor($num*(1+powerPlant.support/100));
                break;

            default:
                this.saving = $num;
        }
    }

    //savingの値を$numだけ減らす（使う）
    usethis($num){
        this.saving -= $num;
    }

    //savingの値を$numだけ増やす（作る）
    //穀物庫、銀行の補正はここでかける。
    makethis($num){

        switch(this){
            case food:
                this.saving +=Math.floor($num*(1+granary.support/100));
                break;

            case money:
                this.saving +=Math.floor($num*(1+bank.support/100));
                break;

            default:
                this.saving += $num;
                break;
        }
    }

    //港で得られた資源はサポート系の補正を掛けない
    makehisByPort($num){

        switch(this){
            case food:
                this.saving +=Math.floor($num);
                break;

            case money:
                this.saving +=Math.floor($num);
                break;

            default:
                this.saving += $num;
                break;
        }
    }

    //マイナスになった値を0にリセットする。食料、生産力、人口、不満が対象
    removeMinus(){
        if(this.saving<0){
            return this.saving =0;
        }else{
            return this.saving;
        }
    }

    //不満を計算し、その値を反映させる。
    getAnger(){
        if(food.saving<0){
            var flack = -1 *food.saving;
            this.makethis(flack);
            history('食料が不足しています！！不足数：'+ flack,3);
        }

        //happinesHandiは人口ハンデ。happinesHandiの値を越えるまでは不満は出ない。怒りはたまらないが、不幸なイベントが起こりやすくなる
        if((happiness.saving-people.saving)<0 && people.saving>happinesHandi){
            var hlack = happiness.saving-people.saving;
            happiness.setValue(hlack);

            history('福祉支出が不足しています！不足数'+ (hlack*-1),3);
        }else if((happiness.saving-people.saving)>0 && people.saving>happinesHandi){
            var rest = happiness.saving-people.saving;
            this.usethis(Math.floor(rest/people.saving));
        }
    }
        
}

class Building {
    constructor(name,sizeLevel,prodLevel,worker,product,foodComsume,image,available,unlockProd,unlockMoney){
        this.name = name;
        this.sizeLevel = sizeLevel;
        this.prodLevel = prodLevel;
        this.worker = worker;
        this.maxWorker = this.sizeLevel*5;
        this.prodPerWorker = this.prodLevel*product;//一人当たりの生産量
        this.foodComsume = foodComsume;
        this.image = image;
        this.avail = available;
        this.unlockProd=unlockProd;
        this.unlockMoney=unlockMoney;
        this.product=product;
        this.accident_flg =false;
        this.unavail = 0;

        this.sizeUpMoney = 6;
        this.sizeUpProd = 15;

        this.qualiUpMoney = 8;
        this.qualiUpProd = 40;
    }

    costUp(){
        this.sizeUpMoney = Math.floor(this.sizeLevel*5*this.sizeLevel*0.5)*3;
        this.sizeUpProd = 5*this.sizeLevel*(this.sizeLevel+9)*0.3;

        this.qualiUpMoney = Math.floor(this.prodLevel*5*this.prodLevel*0.5)*4;
        this.qualiUpProd = 5*this.prodLevel*(this.prodLevel+9)*0.8;
    }

    workOut(){
        this.prodPerWorker = 0;
        this.accident_flg =true;
        history(this.name+'が災害によって破壊され5ターンの間使用不能になりました！',3);
    }

    strikeOut(){
        this.prodPerWorker = 0;
        this.accident_flg =true;

        if(this.prodLevel>2){
            this.prodLevel -= 1;
            this.costUp();
            history(this.name+'が暴徒によって破壊され、効率レベルが1下がり、5ターンの間使用不能になりました！',3);
        }else{
            history(this.name+'が暴徒によって破壊され、5ターンの間使用不能になりました！',3);
        }
        
    }

    repaired(){
        this.prodPerWorker = (this.prodLevel-1)+this.product;
        this.accident_flg =false;
        history(this.name+'が復旧しました！',2);
    }


    foodConsumeVal(){
        //上流の各マスでの計算命令で弾いているから、this.availの設定はいらないかも。。
        if(this.avail!=0){
            switch(this){
                case residens:
                    food.usethis(0);
                    break;

                default:
                    food.usethis((this.foodComsume)*(this.worker));
            }
        }
    }

    productInfo(){
        $('.info-product').text("生産物");
        var allProd = this.worker * this.prodPerWorker; //今の労働者で作れる総生産量
        //var efficiency = this.prodPerWorker;//今のレベルでの一人当たりの効率
        switch(this){
            case farm:
                $('#product').attr('class',food.iconClass);
                $('.info-efficensyNum').text(this.prodPerWorker);
                break;

            case factory:
                $('#product').attr('class',product.iconClass);
                $('.info-efficensyNum').text(this.prodPerWorker);
                break;

            case residens:
                var allProd = people.saving;
                $('#product').attr('class',people.iconClass);
                $('.info-efficensyNum').text('--');
                break;
        }
        //効率の情報
        $('.info-efficensyNum').text(this.prodPerWorker);

        $('#useItem').attr('class',food.iconClass);
        $('.info-useNum').text((this.foodComsume)*(this.worker));

        $('#useItem2').attr('class',"");
        $('.info-useNum2').text("");

        //全ての生産物
        $('.info-productNum').text(allProd);
    }



    productMake(){
        //console.log(product.saving)
        //workerから得られる生産量は整数なのでMath.floorはいらないが、念の為
        if(this.avail!=0){
            switch(this){
                case farm:
                    food.makethis(Math.floor(this.worker * this.prodPerWorker));
                    break;
    
                case factory:
                    product.setValue(Math.floor(this.worker * this.prodPerWorker));
                    //console.log(product.saving);
                    break;
            }
        }
        
    }

    //生産総数
    productVal(){
        return (this.prodPerWorker)*(this.worker)*this.avail
    }

    incWoker(){
        if(this.worker < this.maxWorker && 0<getFreePeople()){
            this.worker += 1;
        }else if(getFreePeople() == 0){
            history('就業させる労働者がいません。',3);
        }else{
            history('就業できる労働者が最大に達しています。',3);
        }
    }

    decWoker(){
        if(0<this.worker){
            this.worker -= 1;
        }else{
            history('これ以上減らせません。',3)
        }
    }




    sizeUp(){
        
        if(this.sizeUpMoney <= money.saving && this.sizeUpProd <= product.saving){
            product.usethis(this.sizeUpProd);
            money.usethis(this.sizeUpMoney);
            this.sizeLevel += 1;
            this.costUp();

            if(this==residens){
                //10ずつ増えていく
                people.makethis(10);
                history('人口が10増えました！',2);
            }else{
                this.maxWorker=this.sizeLevel*5;
                history(this.name+'の規模レベルが上がりました！',2);
            }
            
        }else{
            history('レベルアップに必要な資源が足りません。',3);
        }
    }

    efficiUp(){
        //console.log('現在：'+this.prodLevel);
        if(this.qualiUpMoney <= money.saving && this.qualiUpProd <= product.saving && !this.accident_flg){
            product.usethis(this.qualiUpProd);
            money.usethis(this.qualiUpMoney);

            //prodPerWorkerにはコンストラクタでプロパティ出ないproductによって初期値が決まっているので
            var past = this.prodPerWorker;
            this.prodLevel += 1;
            this.prodPerWorker=past + 1;
            this.costUp();
            history(this.name+'の効率レベルが上がりました！',2);
        }else if(this.accident_flg){
            history('現在復旧中のため効率レベルはあげられません。',3);
        }else{
            history('レベルアップに必要な資源が足りません。',3);
        }
    }

    htmlConvert(){
        if(this == residens){
            $('.noNeed-residens').css({'display':'none'});
            $('.product-info').css({'justify-content':'flex-start'});
        }else{
            $('.noNeed-residens').css({'display':'inline-block'});
            $('.product-info').css({'justify-content':'space-around'});
        }
    }


    unlockBld(cellId){
        if(this.unlockMoney <= money.saving && this.unlockProd <= product.saving){
            this.avail = 1;
            product.usethis(this.unlockProd);
            money.usethis(this.unlockMoney);

            $('#'+cellId).removeClass('unavailable');
            history(this.name+'が建設されました。',2);
        }else{
            history(this.name+'の建設に必要な資源が足りません！',3);
        }
    }


    //建物情報を取得する
    showBuldInfo(){
        //基本的にはunlock情報は見えなくしておく。
        $('.unlock-info').css({'display':'none'});
        $('.buildInfo-port').css({'display':'none'});
        $('.buildInfo').css({'display':'block'});

        if(this == residens){
            $('.buildInfo').find('img').attr('src',this.image);
            $('.info-buildName').text(this.name);
            $('.info-product').text('人口');
            $('.info-productNum').text(this.productInfo());

            $('.info-upsize').text("人口を10増加("+this.sizeLevel+"回目)");
            this.colorChangeProd('.prod-cost-sizeUp',this.sizeUpProd);
            this.colorChangeProd('.money-cost-sizeUp',this.sizeUpMoney);
        }else if(this.avail==0){
            //利用不可の建物を選択した場合
            $('.unlock-info').css({'display':'block'});
            $('.buildInfo').css({'display':'none'});

            $('.unlock-info').find('img').attr('src',this.image);
            $('.info-buildName').text(this.name);

            this.colorChangeProd('.prod-cost-unlock',this.unlockProd);
            this.colorChangeMoney('.money-cost-unlock',this.unlockMoney);
        }else{
            
            $('.buildInfo').find('img').attr('src',this.image);
            $('.info-buildName').text(this.name);

            //労働者が何人働いているかを表示
            $('.info-workerNum').text(this.worker + "/" +this.maxWorker);

            //現在の生産品がどれほどか表示
            $('.info-product').text('生産物');
            $('.info-productNum').text(this.productInfo());

            //console.log(this.sizeUpProd);
            this.liveNeedRes();

        }
    }
    liveNeedRes(){
        $('.info-upsize').text("規模レベル:Lv." + this.sizeLevel);
        this.colorChangeProd('.prod-cost-sizeUp',this.sizeUpProd);
        this.colorChangeMoney('.money-cost-sizeUp',this.sizeUpMoney);


        $('.info-upquality').text("効率レベル:Lv." + this.prodLevel);
        this.colorChangeProd('.prod-cost-qualityUp',this.qualiUpProd);
        this.colorChangeMoney('.money-cost-qualityUp',this.qualiUpMoney);

        this.colorChangeProd('.prod-cost-unlock',this.unlockProd);
        this.colorChangeMoney('.money-cost-unlock',this.unlockMoney);
    }

    //レベルアップ可能なのかを判断しやすくするために文字色を変える
    colorChangeProd(className,inst){
        //効率
        if(product.saving < inst && liveProdMake() < inst){
            $(className).text(inst).css({'color':'red'});
        }else if(product.saving >= inst && liveProdMake() > inst){
            $(className).text(inst).css({'color':'green'});
        }else if(product.saving < inst && liveProdMake() >= inst ){
            $(className).text(inst).css({'color':'purple'});
        }else{
            $(className).text(inst).css({'color':'green'});
        }
    }

    colorChangeMoney(className,inst){
        //生産性
        if(money.saving < inst){
            $(className).text(inst).css({'color':'red'});
        }else if(money.saving >= inst){
            $(className).text(inst).css({'color':'green'});
        }
    }
    
}

class PortBuilding extends Building{
    constructor(name,sizeLevel=1,prodLevel=1,worker=0,product,foodComsume,image,available,unlockProd,unlockMoney,sellraito,buyraito){
        super(name,sizeLevel,prodLevel,worker,product,foodComsume,image,available,unlockProd,unlockMoney);
        
        this.product = product;
        this.sellraito = sellraito;
        this.buyraito = buyraito;
        this.accident_flg =false;
        this.unavail = 0;

        this.sellProd=0;
        this.sellFood=0;
        this.buyProd=0;
        this.buyFood=0;

        this.prodPerWorker = product*sizeLevel
        this.carry= this.prodPerWorker*this.worker;
        this.carryNum = 0;


    }

    showBuldInfo(){
        //基本的にはunlock情報は見えなくしておく。
        $('.unlock-info').css({'display':'none'});
        //$('.buildInfo-port').css({'display':'none'});
        $('.buildInfo').css({'display':'block'});

        if(this.avail==0){
            //利用不可の建物を選択した場合
            $('.unlock-info').css({'display':'block'});
            $('.buildInfo').css({'display':'none'});

            $('.unlock-info').find('img').attr('src',this.image);
            $('.info-buildName').text(this.name);

            this.colorChangeProd('.prod-cost-unlock',this.unlockProd);
            this.colorChangeMoney('.money-cost-unlock',this.unlockMoney);
        }else{
            $('.buildInfo').css({'display':'none'});
            $('.buildInfo-port').css({'display':'block'});

            $('.buildInfo-port').find('img').attr('src',this.image);
            $('.info-buildName').text(this.name);

            $('.port-worker-habdle').text(this.prodPerWorker);
            $('.port-workerNum').text(this.worker+"/"+this.maxWorker);

            
            $('.max-items').text(this.showcarryNum() + "/MAX"+this.maxWorker*this.prodPerWorker);
            $('.info-useNum').text(this.foodComsume*this.worker);

            $('.sellRaito').text("X"+this.sellraito);
            $('.earn-money-prod').text("+"+Math.floor(this.sellraito*this.sellProd));
            $('.earn-money-food').text("+"+Math.floor(this.sellraito*this.sellFood));

            $('.buyRaito').text("X"+this.buyraito);
            $('.spend-money-prod').text("-"+Math.floor(this.buyraito*this.buyProd));
            $('.spend-money-food').text("-"+Math.floor(this.buyraito*this.buyFood));

            this.liveNeedRes();
        }
    }

    workOut(){
        this.prodPerWorker = 0;
        this.accident_flg =true;
        history(this.name+'が災害によって破壊され5ターンの間使用不能になりました！',3);
    }

    strikeOut(){
        this.prodPerWorker = 0;
        this.accident_flg =true;

        if(this.prodLevel>2){
            this.prodLevel -= 1;
            this.costUp();
            history(this.name+'が暴徒によって破壊され、効率レベルが1下がり、5ターンの間使用不能になりました！',3);
        }else{
            history(this.name+'が暴徒によって破壊され、5ターンの間使用不能になりました！',3);
        }
        
    }

    repaired(){
        this.prodPerWorker = this.product*this.prodLevel;
        this.accident_flg =false;
        history(this.name+'が復旧しました！',2);
    }

    carryItem(num){
        this.carry -= num;
        this.carryNum +=num;
    }

    showcarryNum(){
        if(this.carry <0){
            return 0;
        }else{
            return this.carry;
        }
    }

    

    portfoodCons(){
        var sys = this.carryNum/this.prodPerWorker;
        if(this.carryNum%this.prodPerWorker==0){
            return sys;
        }else if(0<sys && sys<=1){
            return 1;
        }else if(1<sys){
            return Math.floor(sys)+1;
        }

        
    }

    resethandle(){
        this.carry= this.prodPerWorker*this.worker;
        this.carryNum=0;
    }

    //商用港で得られた資源にはサポート系の補正を掛けないようにする


    sellthis(item){
        switch(item){
            case product:
                if(this.sellProd<= this.carry){
                    product.usethis(this.sellProd);
                    this.carryItem(this.sellProd);

                    var getmoney = Math.floor(this.sellraito*this.sellProd);
                    money.makehisByPort(getmoney);
                    history('貿易:生産力を'+this.sellProd+'単位売却をし、'+getmoney+'の資金を得ました。',2)
                }else{
                    history('売却数が取扱量をオーバーしているため売却できません。売却量を調整してください。',3)
                }
                break;

            case food:
                //console.log(this.sellFood);
                if(this.sellFood<= this.carry){
                    food.usethis(this.sellFood);
                    this.carryItem(this.sellFood);

                    var getmoney = Math.floor(this.sellraito*this.sellFood);
                    money.makehisByPort(getmoney);
                    history('貿易:食料を'+this.sellFood+'単位売却をし、'+getmoney+'の資金を得ました。',2)
                }else{
                    history('売却数が取扱量をオーバーしているため売却できません。売却量を調整してください。',3)
                }
                break;
        }
    }

    buythis(itme){
        switch(itme){
            case product:
                if(this.buyProd<= this.carry){
                    product.makehisByPort(this.buyProd);
                    this.carryItem(this.buyProd);

                    var paymoney = Math.floor(this.buyraito*this.buyProd);
                    money.usethis(paymoney);
                    history('貿易:'+paymoney+'の資金を払い、生産力を'+this.buyProd+'購入しました。',2)
                }else{
                    history('売却数が取扱量をオーバーしているため売却できません。売却量を調整してください。',3)
                }
                break;

            case food:
                if(this.buyFood<= this.carry){
                    food.makehisByPort(this.buyFood);
                    this.carryItem(this.buyFood);

                    var paymoney = Math.floor(this.buyraito*this.buyFood);
                    money.usethis(paymoney);
                    history('商用港:'+paymoney+'の資金を払い、食料を'+this.buyFood+'購入しました。',2);
                }else{
                    history('商用港:売却数が取扱量をオーバーしているため売却できません。売却量を調整してください。',3)
                }
                    break;
        }
    }

    incWoker(){
        if(this.worker < this.maxWorker && 0<getFreePeople()){
            this.worker += 1;
            this.carry += this.prodPerWorker;
        }else if(getFreePeople() == 0){
            history('就業させる労働者がいません。',3);
        }else{
            history('就業できる労働者が最大に達しています。',3);
        }
    }

    decWoker(){
        if(this.portfoodCons()<=this.worker-1 || this.accident_flg){
            this.carry -= this.prodPerWorker;
            this.worker -= 1;
        }else if(this.worker==0){
            history('これ以上減らせません。',3);
        }else{
            history('すでに荷物を取り扱った分の労働者数は減らせません。',3);
        }
    }

    liveNeedRes(){
        $('.info-upsize').text("規模レベル:Lv." + this.sizeLevel);
        this.colorChangeProd('.prod-cost-sizeUp',this.sizeUpProd);
        this.colorChangeMoney('.money-cost-sizeUp',this.sizeUpMoney);


        $('.info-upquality').text("効率レベル:Lv." + this.prodLevel);
        this.colorChangeProd('.prod-cost-qualityUp',this.qualiUpProd);
        this.colorChangeMoney('.money-cost-qualityUp',this.qualiUpMoney);

        this.colorChangeProd('.prod-cost-unlock',this.unlockProd);
        this.colorChangeMoney('.money-cost-unlock',this.unlockMoney);

        $('.max-items').text(this.showcarryNum() + "/MAX"+this.maxWorker*this.prodPerWorker);
    }

    efficiUp(){
        if(this.qualiUpMoney <= money.saving && this.qualiUpProd <= product.saving && !this.accident_flg){
            product.usethis(this.qualiUpProd);
            money.usethis(this.qualiUpMoney);

            this.prodLevel += 1;
            this.prodPerWorker = this.product*this.prodLevel;

            //効率をあげた後の挙動がおかしい
            this.carry = (this.prodPerWorker*this.worker)-this.carryNum;

            history(this.name+'の効率レベルが上がりました！',2);
            this.costUp();
        }else if(this.accident_flg){
            history('現在復旧中のため効率レベルはあげられません。',3);
        }else{
            history('レベルアップに必要な資源が足りません。',3);
        }

    }

    autoProdSell(){
        if($(".productAutoSell").prop('checked')){
            if(product.saving<= this.carry && product.saving!=0){
                //生産力が0でなく、取扱量が生産力全てを売れる分だけ残っている場合。
                var getmoney = (Math.floor(this.sellraito*product.saving));

                money.makehisByPort(getmoney);
                history('商用港:余った生産力'+product.saving+'を売却をし、'+getmoney+'の資金を得ました。',2)
            }else if(product.saving!=0 && this.carry <=0){
                //生産力は余っているが、取扱量がない場合
                history('商用港での取扱量が不足していたため、余った生産物を売却できませんでした。',3);
            }else if(product.saving==0){
                //生産力がない場合
                history('商用港:売却可能な生産力が余っていませんでした。',3);
            }else if(product.saving > this.carry && product.saving!=0 && this.carry >0){
                //生産力が0でなく、売れる生産力が取扱量を上回っている場合（しかし取扱量は0出ない。）。
                var sell = this.carry;

                product.usethis(sell);
                this.carryItem(sell);

                var getmoney = (Math.floor(this.sellraito*sell));
                money.makehisByPort(getmoney);
                history('商用港:取扱量が不足し、余った生産力全てを売却できませんでした。'+sell+'単位売却をし、'+getmoney+'の資金を得ました。',2)
            }
        }
    }
}

class StoreBuilding extends Building{
    constructor(name,sizeLevel=1,prodLevel=1,worker=0,product,foodComsume,image,available,unlockProd,unlockMoney,raito){
        super(name,sizeLevel,prodLevel,worker,product,foodComsume,image,available,unlockProd,unlockMoney);
        this.raito = raito;
        this.accident_flg = false;
        this.unavail = 0;
    }

    //店系の建物は売るものが必要
    productMake(){
                if(this.worker <= product.saving){
                    //売るものが実際に売る量を上回っている。（在庫ある）
                    money.makethis(Math.floor(this.worker * this.raito));
                    product.usethis(this.worker);
                }else{
                    //売るものが実際に売る量を下回っている。（在庫が足りない）
                    //売る分だけ売る。
                    money.makethis(Math.floor(product.saving * this.raito));
                    product.usethis(product.saving);
                    history(this.name+':売却に必要な生産力が足りませんでした。',3);
                }

                //ここにこれがないと自動売却ができない
                port.autoProdSell();

    }

    workOut(){
        this.raito = 0;
        this.accident_flg=true;
        history(this.name+'が災害によって破壊され5ターンの間使用不能になりました！',3);
    }

    strikeOut(){
        this.raito = 0;
        this.accident_flg =true;

        if(this.prodLevel>2){
            this.prodLevel -= 1;

            this.costUp();
            history(this.name+'が暴徒によって破壊され、効率レベルが1下がり、5ターンの間使用不能になりました！',3);
        }else{
            history(this.name+'が暴徒によって破壊され、5ターンの間使用不能になりました！',3);
        }
        
    }

    repaired(){
        this.raito = (this.prodLevel+1)/2;
        this.accident_flg=false;
        history(this.name+'が復旧しました！',2);
    }


    productInfo(){
        $('.info-product').text("生産物");
        var allProd = (Math.floor(this.worker * this.raito)); //今の労働者で作れる総生産量
        //var efficiency = this.prodPerWorker;//今のレベルでの一人当たりの生産性

        //効率の表示
        $('.info-efficensyNum').text(this.raito);
        $('.info-product').text("生産物");

        //生産物のお金アイコン
        $('#product').attr('class',money.iconClass);
        
        //消費物の表示
        $('#useItem').attr('class',product.iconClass);
        $('.info-useNum').text(this.worker);
        

        $('#useItem2').attr('class',food.iconClass);
        $('.info-useNum2').text((this.foodComsume)*(this.worker));

        //生産数の表示
        $('.info-productNum').text(allProd);
    }

    efficiUp(){
        if(this.qualiUpMoney <= money.saving && this.qualiUpProd <= product.saving && !this.accident_flg){
            product.usethis(this.qualiUpProd);
            money.usethis(this.qualiUpMoney);

            this.prodLevel += 1;
            //prodPerWorkerにはコンストラクタでプロパティ出ないproductによって初期値が決まっているので
            this.raito += 0.5;
            history(this.name+'の効率レベルが上がりました！',2);
            this.costUp();
        }else if(this.accident_flg){
            history('現在復旧中のため効率レベルはあげられません。',3);
        }else{
            history('レベルアップに必要な資源が足りません。',3);
        }
    }
}

class SupportBuilding extends Building{
    constructor(name,sizeLevel=1,prodLevel=1,worker=0,product,foodComsume,image,available,unlockProd,unlockMoney,raito){
        super(name,sizeLevel,prodLevel,worker,product,foodComsume,image,available,unlockProd,unlockMoney);
        this.raito = raito;
        this.support = this.raito * this.worker;
        this.accident_flg =false;
        this.unavail = 0;

    }

    showBuldInfo(){
            //基本的にはunlock情報は見えなくしておく。
            $('.unlock-info').css({'display':'none'});
            $('.buildInfo-port').css({'display':'none'});
            $('.buildInfo').css({'display':'block'});
    
            if(this.avail==0){
                //利用不可の建物を選択した場合
                $('.unlock-info').css({'display':'block'});
                $('.buildInfo').css({'display':'none'});
    
                $('.unlock-info').find('img').attr('src',this.image);
                $('.info-buildName').text(this.name);
    
                this.colorChangeProd('.prod-cost-unlock',this.unlockProd);
                this.colorChangeMoney('.money-cost-unlock',this.unlockMoney);
            }else{
                $('.buildInfo').find('img').attr('src',this.image);
                $('.info-buildName').text(this.name);
    
                //労働者が何人働いているかを表示
                $('.info-workerNum').text(this.worker + "/" +this.maxWorker);
    
                //現在の生産品がどれほどか表示
                $('.info-product').text('生産物');
                this.productInfo();
    
                //console.log(this.sizeUpProd);
                this.liveNeedRes();
        }
        
    }

    productInfo(){

        
            $('.info-upquality-wrap').css({'display':'none'});
            var allProd = (Math.floor(this.worker * this.raito)); //今の労働者で出せる効率
            
            //生産性の表示
            $('.info-efficensyNum').text(this.raito+"％");
            $('.info-productNum').text(allProd+"％");
            
            switch(this){
                case granary:
                    //生産物のお金アイコン
                    $('#product').attr('class',food.iconClass);
                    break;

                case powerPlant:
                    //生産物のお金アイコン
                    $('#product').attr('class',product.iconClass);
                    break;

                case bank:
                    //生産物のお金アイコン
                    $('#product').attr('class',money.iconClass);
                    break;


            }
            //生産数の表示
            $('.info-useNum').text(this.worker);
            //消費物の表示
            $('#useItem').attr('class',food.iconClass);
            $('.info-useNum').text((this.foodComsume)*(this.worker));

            $('#useItem2').attr('class',"");
            $('.info-useNum2').text("");

        }

    workOut(){
        this.raito = 0;
        this.accident_flg =true;
        history(this.name+'が災害によって破壊され5ターンの間使用不能になりました！',3);
    }

    strikeOut(){
        this.raito = 0;
        this.accident_flg =true;
        history(this.name+'が暴徒によって破壊され、5ターンの間使用不能になりました！',3);
    }

    repaired(){
        this.raito = 5;
        this.accident_flg =false;
        history(this.name+'が復旧しました！',2);
    }

    sizeUp(){
        
        if(this.sizeUpMoney <= money.saving && this.sizeUpProd <= product.saving){
            product.usethis(this.sizeUpProd);
            money.usethis(this.sizeUpMoney);
            this.sizeLevel += 1;
            this.costUp();

            this.maxWorker+=1;
                history(this.name+'の規模レベルが上がりました！',2);
            
            
        }else{
            history('レベルアップに必要な資源が足りません。',3);
        }
    }

    incWoker(){
        if(this.worker < this.maxWorker && 0<getFreePeople()){
            this.worker += 1;
            this.support = this.raito * this.worker;
        }else if(getFreePeople() == 0){
            history('就業させる労働者がいません。',3);
        }else{
            history('就業できる労働者が最大に達しています。',3);
        }
    }

    decWoker(){
        if(0<this.worker){
            this.worker -= 1;
            this.support = this.raito * this.worker;
        }else{
            history('これ以上減らせません。',3)
        }
    }
}

class WealthBuilding extends Building{
    constructor(name,sizeLevel=1,prodLevel=1,worker=0,product,foodComsume,image,available,unlockProd,unlockMoney,raito){
        super(name,sizeLevel,prodLevel,worker,product,foodComsume,image,available,unlockProd,unlockMoney);
        
        this.raito = raito;
        this.budget = 2;
        this.accident_flg =false;
        this.unavail = 0;
    }

    productMake(){
        var medicBill = this.worker*this.budget;
        money.usethis(medicBill);
        happiness.setValue(this.worker*this.raito);
    }


    productInfo(){

        if(this.avail==0){
            //利用不可の建物を選択した場合
            $('.unlock-info').css({'display':'block'});
            $('.buildInfo').css({'display':'none'});

            $('.unlock-info').find('img').attr('src',this.image);
            $('.info-buildName').text(this.name);

            this.colorChangeProd('.prod-cost-unlock',this.unlockProd);
            this.colorChangeMoney('.money-cost-unlock',this.unlockMoney);
        }else{
        var allProd = (Math.floor(this.worker * this.raito)); //今の労働者で作れる総生産量
        //var efficiency = this.prodPerWorker;//今のレベルでの一人当たりの生産性


        //生産物のリスクアイコン
        $('.info-efficensyNum').text(this.raito);

        $('.info-product').text("取扱量");
        $('.info-productNum').text(allProd);
        $('#product').attr('class',people.iconClass);

        $('#useItem').attr('class',food.iconClass);
        $('.info-useNum').text(this.worker);
        
        $('#useItem2').attr('class',money.iconClass);
        $('.info-useNum2').text(this.worker*this.budget);

        //生産数の表示
        $('.info-productNum').text(allProd);
        }
    }

    efficiUp(){
        //console.log('現在：'+this.prodLevel);
        if(this.qualiUpMoney <= money.saving && this.qualiUpProd <= product.saving && !this.accident_flg){
            product.usethis(this.qualiUpProd);
            money.usethis(this.qualiUpMoney);

            this.prodLevel += 1;
            this.raito +=1;
            this.costUp();
            history(this.name+'の効率レベルが上がりました！',2);
        }else if(this.accident_flg){
            history('現在復旧中のため効率レベルはあげられません。',3);
        }else{
            history('レベルアップに必要な資源が足りません。',3);
        }
    }
}