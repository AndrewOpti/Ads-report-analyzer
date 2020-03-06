function main () {
    //Инструкция https://docs.google.com/document/d/13v13gHWnVPYd0r7p-4Wqm9Q8Q3tFWiy6zecl7HRsbYk
    var email = '', // Указываем почту для уведомлений (если несколько почт,то в кавычках указываем их через запятую!
        maxBudgetInDay = 20,// Значение максимальных расходов в день (Указываем своё)
        maxBudgetInWeek = 900, // Значение максимальных расходов в неделю (Указываем своё)
        maxBudgetInMonth = 4000, // Значение максимальных расходов в месяц (Указываем своё)
        cpaDown = 10,// Значение максимального CPA (Указываем своё)
        convRate = 2;// Значение низкого conversion rate (Указываем своё)
    // Функция проверки бюджета
    function checkingBudget() {
        var campaign,
            budget,
            amountToday = 0,
            amountWeek = 0,
            amountMonth = 0,
            campaigns = getCampaigns(),
            dailyBudget = '',
            weeklyBudget = '',
            monthlyBudget = '';
        while (campaigns.hasNext()) {
            campaign = campaigns.next();
            budget = campaign.getBudget();
            amountToday = budget.getStatsFor('TODAY');
            amountWeek = budget.getStatsFor('LAST_7_DAYS');
            amountMonth = budget.getStatsFor('THIS_MONTH');
            if (amountToday.getCost() > maxBudgetInDay) {
                dailyBudget += '<p>Компания ' + budget.getName() + ' превысила дневной расход. Текущий: '+amountToday.getCost()+'</p>';
                log(dailyBudget);
            }
            if (amountWeek.getCost() > maxBudgetInWeek) {
                weeklyBudget += '<p>Компания ' + budget.getName() + ' превысила недельный расход. Текущий: '+amountWeek.getCost()+'</p>';
            }
            if (amountMonth.getCost() > maxBudgetInMonth) {
                monthlyBudget += '<p>Компания ' + budget.getName() + ' превысила месячный расход. Текущий: '+amountMonth.getCost()+'</p>';
            }
        }
        if(dailyBudget.length > 0){
            sendMail(dailyBudget,'Превышен дневной расход');
        }
        if(weeklyBudget.length > 0){
            sendMail(weeklyBudget,'Превышен недельный расход');
        }
        if(monthlyBudget.length > 0){
            sendMail(monthlyBudget,'Превышен месячный расход');
        }
    }
    // Функция проверки показов
    function checkView(){
        var adsGroupCheck = getCampaigns(),
            adsGroup,
            adsGroupView,
            adsGroupName,
            adsGroupList = [],
            adsGroupError,
            adsGroupMessage = '';
        while(adsGroupCheck.hasNext()){
            adsGroup = adsGroupCheck.next();
            adsGroupView = adsGroup.getStatsFor('TODAY').getImpressions();
            adsGroupName = adsGroup.getName();
            adsGroupList.push({groupName: adsGroupName,groupView: adsGroupView.toFixed(0)});
        }
        adsGroupError = adsGroupList.filter(function(value){
            return value.groupView < 1;
        });
        if(adsGroupError.length > 0){
            for(var i = 0;i<adsGroupError.length;i++){
                adsGroupMessage += '<p>У компании: '+adsGroupError[i].groupName+' 0 показов! </p>';
            }
            sendMail(adsGroupMessage, '0 показов по рекламным компаниям');
        }
    }
// Функция проверки падения CPA
    function checkCPA(){
        var getAdsGroupCheck = getCampaigns(),
            getCpa,
            getCpaForWeek,
            getCpaCost,
            getCpaConv,
            getCpaAdsName,
            cpaResult = '';
        while(getAdsGroupCheck.hasNext()){
            getCpa = getAdsGroupCheck.next();
            getCpaCost = getCpa.getStatsFor('LAST_7_DAYS').getCost();
            getCpaConv = getCpa.getStatsFor('LAST_7_DAYS').getConversions();
            if((getCpaCost && getCpaConv !== 0)&&(getCpaCost && getCpaConv !== NaN)){
                getCpaForWeek = (getCpaCost / getCpaConv).toFixed(0);
            }
            getCpaAdsName = getCpa.getName();
            if(getCpaForWeek > cpaDown){
                cpaResult += '<p>У компании '+getCpaAdsName+' СPA выше указанного. Текущий: '+getCpaForWeek+'</p>';
            }
        }
        sendMail(cpaResult, 'Высокий CPA');
    }
    // Функция проверки низкого conversion rate
    function lowConvRate(){
        var getAdsGroupCheck = getCampaigns(),
            getConv,
            getConvRate = [],
            getAdsName,
            convRateMessage = '',
            test;
        while(getAdsGroupCheck.hasNext()){
            getConv = getAdsGroupCheck.next();
            getAdsName = getConv.getName();
            getConvRate = (getConv.getStatsFor('LAST_7_DAYS').getConversions()/getConv.getStatsFor('LAST_7_DAYS').getClicks()*100).toFixed(0);
            if(getConvRate < convRate){
                convRateMessage += '<p>У компании '+getAdsName+' conversion rate ниже указанного. Текущий: '+getConvRate+'%</p>';
            }
        }
        sendMail(convRateMessage,'Низкий conversion rate');
    }
    /**
     * @param text
     * @param subject
     */
    function sendMail (text, subject) {
        MailApp.sendEmail({
            to: email,
            subject: subject,
            htmlBody: text,
        });
    }

    /**
     *
     * @returns {ActiveX.IXMLDOMNode | Promise<any> | any | string |
     *   IDBRequest<any | undefined> | Function | FormDataEntryValue}
     */
    function getCampaigns(){
        return AdsApp.campaigns().withCondition("CampaignStatus = ENABLED").get();
    }

    /**
     * @param text
     */
    function log (text) {
        Logger.log(text);
    }

    // Запуск методов...
    checkingBudget();
    checkView();
    checkCPA();
    lowConvRate();
}


