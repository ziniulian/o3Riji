// 日记模块

// post 参数解析工具
var bodyParser = require("body-parser");

// 文件位置
var curPath = require.resolve("./index.js").replace("index.js", "");

// LZR 子模块加载
LZR.load([
	"LZR.Base.Time",
	"LZR.Node.Db.Mongo",
	"LZR.Node.Srv.Result",
	"LZR.Node.Srv.ComDbSrv"
]);

var utTim = LZR.getSingleton(LZR.Base.Time);
var clsR = LZR.Node.Srv.Result;

// 常用数据库
var cmdb = new LZR.Node.Srv.ComDbSrv ();
cmdb.logAble = 7;
cmdb.initDb(
	(process.env.OPENSHIFT_MONGODB_DB_URL || "mongodb://localhost:27017/test"),
	"diary"
);

// 创建路由
var r = new LZR.Node.Router ({
	path: curPath,
	hd_web: "web"
});

// 解析 post 参数
r.use("*", bodyParser.urlencoded({ extended: false }));

r.post("/srvGetRj", function (req, res, next) {
	cmdb.get( req, res, next,
		{"tim":(req.body.tim - 0), "typ":1},
		{"_id":0}
	);
});

r.post("/srvAddRj", function (req, res, next) {
	var o = {
		"typ": 1,
		"tim": (req.body.tim - 0),
		"txt": req.body.txt
	};
	if (req.body.title) {
		o.title = req.body.title;
	}
	cmdb.add(req, res, next, {"tim":(req.body.tim - 0), "typ":1}, o);
});

r.post("/srvQryRj", function (req, res, next) {
	cmdb.qry( req, res, next,
		"tim", (req.body.tim - 0), {"typ": 1},
		{"_id": 0, "tim":1, "title":1}
	);
});

r.post("/srvDelRj", function (req, res, next) {
	cmdb.del( req, res, next,
		{"tim":(req.body.tim - 0), "typ":1}
	);
});

r.post("/srvSetRj", function (req, res, next) {
	var b = false;
	var o = {};
	if (req.body.txt) {
		b = true;
		o.txt = req.body.txt;
	}
	if (req.body.title) {
		b = true;
		o.title = req.body.title;
	}
	if (b) {
		cmdb.set(req, res, next, {"tim":(req.body.tim - 0), "typ":1}, {"$set": o});
	} else {
		res.json(clsR.get(0, "", false));
	}
});

/**************************************/

// r.post("/srvAddXq/:nam/:tel/:year/:zo/:op/:job/:tim/:txt", function (req, res, next) {
// 	mdb.qry("add", req, res, next, [o]);
// });
//
// r.post("/srvDelXq/:order", function (req, res, next) {
// 	mdb.qry("del", req, res, next, [o]);
// });
//
// r.post("/srvAddXqSub/:order/:metim/:tim?/:txt?", function (req, res, next) {
// 	mdb.qry("set", req, res, next, [o]);
// });
//
// r.post("/srvDelXqSub/:order/:id", function (req, res, next) {
// 	mdb.qry("set", req, res, next, [o]);
// });
//
// r.post("/srvSetXqSub/:order/:id/:txt?", function (req, res, next) {
// 	mdb.qry("set", req, res, next, [o]);
// });

// 初始化模板
// r.initTmp();

module.exports = r;
