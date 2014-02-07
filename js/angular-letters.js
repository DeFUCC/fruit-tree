/**
 * Created by starov on 26.12.13.
 */
var fruitTree = angular.module('fruitTree',['firebase', 'ui.bootstrap' /*, 'akoenig.deckgrid' */]);
var controllers = {};
fruitTree.controller(controllers);

controllers.lettersCtrl = function ($scope,$firebase) {
    var baseLetters = ['A','B','C','E','H','K','M','O','P','T','X','Y'];
    var baseColors = ['c', 'cd', 'd','dd','e','f','fd','g','gd','a','ad','b'];
    var boxWidth = 160;
    var retina = window.devicePixelRatio > 1;
    if (retina) {boxWidth=320};

    var fruit = document.getElementById('fruit');
    $scope.columner = function () {
        $scope.width=fruit.clientWidth;
        $scope.colsmax=Math.floor($scope.width/boxWidth);
        $scope.cols = $scope.colsmax;
        $scope.$apply();
    };

    window.onresize = $scope.columner;

    $scope.makeColumns = function (obj, cols) {
        var i, col;
        for (i=0;i<obj.sayings.length;i++) {

        }
    };

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

    function Order (order, type, picLink, text) {
        var baseLetters = ['A','B','C','E','H','K','M','O','P','T','X','Y'];
        this.pluses=0;
        this.zeros=0;
        this.minuses=0;
        this.order = order || '0';
        this.type = type || '';
        this.picLink = picLink || '';
        this.text = text || '';
        this.sayings = [];
        this.bit = 1;
        this.availableOrders = baseLetters.concat();
        this.pretaken='';
        this.freeOrders = shuffle(this.availableOrders);
    }

Order.prototype.importSayings = function (obj) {
    this.order=obj.order || '0';
    this.type=obj.type || '';
    this.picLink=obj.picLink || '';
    this.text=obj.text || '';
    this.pretakenOrders=obj.pretakenOrders || [];
    this.bit=obj.bit || 1;
    this.sayings=obj.sayings || [];
    this.pluses=obj.pluses || 0;
    this.minuses=obj.minuses || 0;
    this.zeros=obj.zeros || 0;
    this.availableOrders=obj.availableOrders;
    this.shuffleOrders();
    for (var i=0;i<this.sayings.length;i++) {
        this[this.sayings[i].order] = new Order();
        this[this.sayings[i].order].importSayings(obj[obj.sayings[i].order]);
    }

};
Order.prototype.exportSayings = function () {
        var result = {},i;
        result.order=this.order;
        result.type=this.type;
        result.picLink=this.picLink;
        result.text=this.text;
        result.pretakenOrders=this.pretakenOrders;
        result.bit=this.bit;
        result.sayings=this.sayings;
        result.pluses=this.pluses;
        result.minuses=this.minuses;
        result.zeros=this.zeros;
        result.availableOrders=this.availableOrders;
        for (i=0;i<this.sayings.length;i++) {
            result[this.sayings[i].order]=this[this.sayings[i].order].exportSayings();
        }
        return result;
    };
Order.prototype.ratingSort = function (card) {
    return $scope.root[card.order].minuses - $scope.root[card.order].pluses;
};
Order.prototype.getTotal = function () {
        return this.pluses + this.minuses + this.zeros;
    };
Order.prototype.getRating = function () {
    return this.pluses - this.minuses;
};
Order.prototype.shuffleOrders = function () {
        this.freeOrders = shuffle(this.availableOrders);
    };
Order.prototype.rate = function (sign) {
        switch (sign) {
            case '+':
                this.pluses++;
                break;
            case '0':
                this.zeros++;
                break;
            case '-':
                this.minuses++;
                break;
            default:
                this.zeros++;
        }
    };
Order.prototype.refillOrders = function () {
        var current, result=baseLetters.concat(), order;

        for (var b=0;b<this.bit; b++) {
            current = result.slice(0);
            order=0;
            for (var i=0; i<current.length;i++) {

                for (var j=0;j<12;j++) {

                    result[order++]=current[i]+baseLetters[j];
                }
            }
        }
        this.bit++;
        this.availableOrders = result;
        this.shuffleOrders();
    };
Order.prototype.say = function (order, type, picLink, text) {
    var place = this.availableOrders.indexOf(order);
    if (place>=0) {
        var time = new Date();
        this.sayings.push({order:order, type:type, picLink:picLink, date:time.toLocaleDateString(), time:time.toLocaleTimeString(),  text:text});
        this[order]=new Order(order,type,picLink,text);
        this.availableOrders.splice(place,1);
        this.pretaken='';
        this.shuffleOrders();
        $scope.linkedText = '';   //view repair
        if (this.availableOrders.length == 0) {this.refillOrders()};
        return true;
    }
    return false;
};
Order.prototype.returnOrder = function () {
    this.pretaken='';
    this.shuffleOrders();
};
Order.prototype.pretakeOrder = function (order) {
    this.pretaken = order;
    this.shuffleOrders();
    return order
};

    $scope.root = new Order();
    $scope.getColor = function (order) {
        return order.substring(0,1);
    };
    $scope.reset = function () {
        $scope.root = new Order();
    };


$scope.firebase = $firebase(new Firebase('https://frukt.firebaseio.com')); //creating a firebase object
$scope.firebase.$bind($scope, "remote"); //bind a $scope.remoteLetters object for saving

$scope.saveToFireBase = function () {
    $scope.remote.root = $scope.root.exportSayings();
};
$scope.loadFromFireBase = function () {
    $scope.root=new Order();
    $scope.root.importSayings($scope.remote.root);
    $scope.root.shuffleOrders();
 };

$scope.types=['Design','Event','Person','Saying'];

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

