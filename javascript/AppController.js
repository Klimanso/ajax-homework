var AppController = function(){
    'use strict';

    var userInput = document.getElementsByClassName('user-name-input')[0],
        requestSender = document.getElementsByClassName('search')[0],
        defaultRequests = {
            user: 'https://api.github.com/users/',
            repos: 'https://api.github.com/users/@name/repos'
        };

    userInput.addEventListener('input', function(){
        if(!this.value.length)
            requestSender.className = 'disabled';
        else
            requestSender.className = 'send-button';
    });

    requestSender.addEventListener('click',function(){
        if(!userInput.value.length) return;

        var userName = userInput.value,
            isUserInfoInLocalStorage = !!localStorage[userName + '-info'],
            isUserReposInLocalStorage = !!localStorage[userName + '-repos'];

        if(localStorage && (!isUserInfoInLocalStorage && !isUserReposInLocalStorage)){
            callAjax(defaultRequests['user'] + userName, function(arg){
                userRequestListener(arg, userName);
            });
            callAjax((defaultRequests['repos'].replace('@name', userName)), function(arg){
                reposRequestListener(arg, userName);
            });
        }

        update(userName);
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
    function update(name){
        if(!name) return false;

        var dataInfo = JSON.parse(localStorage.getItem(name + '-info')),
            dataRepos = JSON.parse(localStorage.getItem(name + '-repos')),
            userInformation = dataInfo instanceof Array ? undefined : dataInfo,
            reposOfUser = dataRepos instanceof Array ? dataRepos : undefined;

        if(userInformation) AppController.userInf(userInformation);
        if(reposOfUser) AppController.repos(reposOfUser);

        AppController.notFound(false);

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

        localStorage.setItem(name + '-info', JSON.stringify(responseObject));
        update(name);
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

        localStorage.setItem(name + '-repos', JSON.stringify(responseObject));
        update(name);
    }

    return {
        userInf: ko.observable(),
        repos: ko.observable(),
        notFound: ko.observable(false)
    };

}();


