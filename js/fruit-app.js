/**
 * Created by starov on 26.12.13.
 */
var fruitTree = angular.module('fruitTree', ['firebase', 'ui.bootstrap']);
var controllers = {};
fruitTree.controller(controllers);



controllers.lettersCtrl = function ($scope, $firebase) {
    var baseLetters = ['A', 'B', 'C', 'E', 'H', 'K', 'M', 'O', 'P', 'T', 'X', 'Y'];
    var baseColors = ['c', 'cd', 'd', 'dd', 'e', 'f', 'fd', 'g', 'gd', 'a', 'ad', 'b'];


     function shuffle(massive) {
        arr = massive.concat();
        for (var i = arr.length - 1; i > 0; i--) {
            var num = Math.floor(Math.random() * (i + 1));
            var d = arr[num];
            arr[num] = arr[i];
            arr[i] = d;
        }

        return arr;
    }

    function getTypes (type) {

        switch (type.type) {
            case 'design': return [{name:'Название'}];
            default: return [{name:'Высказывание'}];
        }
    }

    function Type(type, name, icon) {
        this.type=type;
        this.name=name;
        this.icon=icon || '';
        this.all = [];
    }

    var t = {
        design: new Type('design','Затея', 'design'),
        preDesign: new Type('preDesign','Проект затеи', 'sandbox'),
        demand: new Type('demand','Поставка', 'demand'),
        task: new Type('task','Задача', 'task'),
        event: new Type('event','Событие'),
        thing: new Type('thing','Штука'),
        skill: new Type('skill','Навык'),
        person: new Type('person','Личность'),
        face: new Type('face','Лицо'),
        saying: new Type('saying','Высказывание'),
        status: new Type('status','Статус'),
        step: new Type('step', 'Ступень'),
        rate: new Type('rate', 'Оценка'),
        title: new Type('title','Название'),
        window: new Type('window','Окно'),
        idea: new Type('idea','Идея'),
        aim: new Type('aim','Цель'),
        gist: new Type('gist','Суть'),
        place: new Type('place','Место'),
        time: new Type('time','Срок'),
        theory: new Type('theory','Теория'),
        practice: new Type('practice','Практика'),
        question: new Type('question','Вопрос'),
        answer: new Type('answer','Ответ'),
        worth: new Type('worth','Ценность'),
        specification: new Type('specification','Уточнение'),
        name: new Type('name','ФИО'),
        phone: new Type('phone','Телефон'),
        eMail: new Type('eMail','Эл. почта'),
        contact: new Type('contact','Контакт'),
        picture: new Type('picture','Картинка'),
        video: new Type('video','Видео'),
        sandbox: new Type('sandbox', 'Инкубатор затей')
    };
    t.getAll = function (type) {
        var all = [];
        if (this.hasOwnProperty(type.type)) {
            all= all.concat(this[type.type].all);
        }

        return all;
    };

    t.design.all=[t.title, t.status, t.step, t.rate, t.window, t.idea, t.aim, t.gist, t.place, t.time, t.face, t.theory, t.practice, t.question, t.answer, t.task, t.demand];
    t.preDesign.all = t.design.all;
    t.sandbox.all=[t.preDesign];

    $scope.types = t;

    function Order(order, type, picLink, heading, text, date) {
        this.pluses = 0;
        this.zeros = 0;
        this.minuses = 0;
        this.date = date;
        this.order = order || '0';
        this.type = type;
        this.picLink = picLink || '';
        this.heading = heading || '';
        this.text = text || '';
        this.bit = 1;
        this.branches = [];
        this.availableOrders = baseLetters.concat();
        this.pretaken = '';
        this.freeOrders = shuffle(this.availableOrders);
        this.add = true;
    }


    $scope.ratingSort = function (card) {
        return card.minuses - card.pluses;
    };
    $scope.shuffleOrders = function (stem) {
        stem.freeOrders = shuffle(stem.availableOrders);
    };
    $scope.rate = {};
    $scope.rate.plus = function (card) {card.pluses++};
    $scope.rate.minus = function (card) {card.minuses++};
    $scope.rate.zero = function (card) {card.zeros++};
    $scope.rate.getTotal = function (card) {return card.pluses + card.minuses + card.zeros};
    $scope.rate.getRating = function (card) {return card.pluses - card.minuses;};
    $scope.rate.sort = function (card) {return card.minuses - card.pluses;};


    $scope.select = function(card) {
        $scope.sel = card || '';
    };

    $scope.getColor = function (order) {
        return order.substring(0, 1);
    };

    $scope.exportJSON = function () {
        $scope.importShow = true;
        $scope.JSON = JSON.stringify($scope.fruit);
    };
    $scope.importShow = false;
    $scope.importJSON = function () {
        $scope.importShow = true;
        $scope.fruit = JSON.parse($scope.JSON);
    };
    $scope.loaded = false;
    $scope.remote = {};
    $scope.firebase = $firebase(new Firebase('https://frukt.firebaseio.com')); //creating a firebase object
    $scope.firebase.$bind($scope, "remote"); //bind a $scope.remote object for saving

    $scope.saveToFireBase = function () {
        $scope.remote.fruit = $scope.fruit;
    };
    $scope.loadFromFireBase = function () {
        $scope.fruit = $scope.remote.fruit;
    };
    $scope.firebase.$on("loaded", function() {
        $scope.loaded = true;
    });
    $scope.proto = Order;
    $scope.sel='';
    $scope.setFruit = function () {
        $scope.fruit = {
            f: new Order('Ф','foundation','', 'Фонд', '— некоммерческая организация, все ресурсы которой направляются на реализацию ее Миссии.' ),
            r: new Order('P', 'development', '','Развитие', '— движение системы к сместившейся точке равновесия.'),
            u: new Order('Y','universalization','','Универсализация','- реализация стремления каждого элемента системы овладеть практическим опытом изучения всей системы.'),
            k: new Order('K','cooperation','','Кооперация','- сложение всех возможных усилий для решения задач, неразрешимых индивидуально.'),
            t: new Order('T','creativity','','Творчество','- процесс осознанного приложения свободно определяемого усилия с целью увеличения меры совершенства окружающего мира'),
            tree: new Order('B','tree','','Фруктовое дерево','- общий обзор структуры потоков ФРУКТа'),
            designs: new Order('O','designs','','Затеи','Затея — подробный план реализации общественно значимого инфраструктурного проекта'),
            tasks: new Order('X','tasks','','Задачи','Задача — описание необходимого к реализации действия с приложением всей имеющейся информации'),
            demands: new Order('A','demands','','Поставки','Поставка - описание необходимых для реализации затей предметов с приложением всей имеющейся информации'),
            sandbox: new Order('E',$scope.types.sandbox,'','Инкубатор затей','- место коллективной разработки затей.')
        };
        $scope.fruit.tasks.add = false;
        $scope.fruit.demands.add = false;
        $scope.fruit.tree.add = false;
        $scope.fruit.sandbox.add = true;
    };
    $scope.setFruit();
    $scope.pretaken = '';

    /*   $scope.loadFromLocalStorage = function () {
     if (localStorage.length > 0) {
     $scope.root = new Order();
     $scope.root.importSayings(JSON.parse(localStorage["root"]));
     $scope.root.shuffleOrders();
     }
     };


     $scope.saveToLocalStorage = function () {
     localStorage["root"] = JSON.stringify($scope.root.exportSayings());
     console.log(localStorage['root']);
     };

     */


};

