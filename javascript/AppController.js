var AppController = function(){
    'use strict';

    var userInput = document.getElementsByClassName('user-name-input')[0],
        requestSender = document.getElementsByClassName('search')[0],
        defaultRequests = {
            user: 'https://api.github.com/users/',
            repos: 'https://api.github.com/users/@name/repos'
        },
        /**
         * Функция проверки и очистки localStorage при загрузке страницы
         * @return {boolean} удачен ли результат операции
         */
        checkCache = function(){
            if(localStorage){
                var num = 0,
                curDate = new Date().getTime(),
                curItem,
                curItemKey;

                for(;num < localStorage.length; num++){
                    curItemKey = localStorage.key(num);
                    curItem = JSON.parse(localStorage[curItemKey]);
                    if(curDate - curItem.time < 86400000)
                        localStorage.removeItem(curItemKey)
                }
                return true;
            }
            return false;
        }();

    userInput.addEventListener('input', function(){
        if(!this.value.length)
            requestSender.className = 'disabled';
        else
            requestSender.className = 'send-button';
    });

    requestSender.addEventListener('click',function(){
        if(!userInput.value.length) return;

        if(!localStorage){
            throw new Error('Local Storage not available');
        }

        var userName = userInput.value,
            isUserInLocalStorage = !!localStorage[userName];

        if(!isUserInLocalStorage){
            console.log('AJAX');
            callAjax(defaultRequests['user'] + userName, function(arg){
                userRequestListener(arg, userName);
            });
            callAjax((defaultRequests['repos'].replace('@name', userName)), function(arg){
                reposRequestListener(arg, userName);
            });
        }

        updateModel(userName);
    });

    /**
     * Функция отправки звпроса на сервер api.github
     * @param  {string} url запросов
     * @param  {function} callback функция обработчик
     */
    function callAjax(url, callback){
        var xhr = new XMLHttpRequest();

        xhr.open('GET', url);

        xhr.onload = callback;

        xhr.error = function(){
            throw new Error('Server Error');
        };
        xhr.send();
    }

    /**
     * Функция обновления содержимого страницы
     * @param  {string} name имя User
     * @return {boolean} удачен ли результат операции
     */
    function updateModel(name){
        if(!name) return false;

        var data = JSON.parse(localStorage.getItem(name)),
            userInformation = data ? data.user : undefined,
            reposOfUser = data ? data.repos : undefined;

        if(userInformation) AppController.userInf(userInformation);
        if(reposOfUser) AppController.repos(reposOfUser);

        AppController.notFound(false);

        return true;
    }

    /**
     * Функция обновления содержимого locaStorage при запросах
     * @param  {string} signature название обновляемой части
     * @param  {string} userName имя User
     * @param  {object} response ответ сервера на запрос
     * @return {boolean} удачен ли результат операции
     */
    function updateStorage(signature, userName, response){
        if(!signature || !userName || !response) return false;

        if(localStorage[userName]){
            var localInf = JSON.parse(localStorage[userName]);
            localInf[signature] = response;
            localStorage.setItem(userName, JSON.stringify(localInf));
        }
        else{
            var obj = {
                time: new Date().getTime()
            };
            obj[signature] = response
            localStorage.setItem(userName, JSON.stringify(obj));
        }
        return true;
    }

    /**
     * Функция-обработчик ответа от сервера на запрос о User
     * @param  {object} xmlRequest объект запроса
     * @param  {string} name имя User
     */
    function userRequestListener(xmlRequest, name){
        var resp = xmlRequest.target;

        if (resp.readyState != 4) return;

        if(resp.status !== 200) {
            AppController.userInf(undefined);
            AppController.notFound(true);
            return;
        }
        var responseObject = JSON.parse(resp.responseText);

        updateStorage('user',name, responseObject);
        updateModel(name);
    }

    /**
     * Функция-обработчик ответа от сервера на запрос о репозиториях User
     * @param  {object} xmlRequest объект запроса
     * @param  {string} name имя User
     */
    function reposRequestListener(xmlRequest, name){
        var resp = xmlRequest.target;

        if (resp.readyState != 4) return;

        if(resp.status !== 200) {
            AppController.repos(undefined);
            AppController.notFound(true);
            return;
        }
        var responseObject = JSON.parse(resp.responseText);

        updateStorage('repos', name, responseObject);
        updateModel(name);
    }

    return {
        userInf: ko.observable(),
        repos: ko.observable(),
        notFound: ko.observable(false)
    };

}();


