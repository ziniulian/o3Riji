// 日记模块

// post 参数解析工具
var bodyParser = require("body-parser");

// 文件位置
var curPath = require.resolve("./index.js").replace("index.js", "");

// LZR 子模块加载
LZR.load([
	"LZR.Base.Time",
	"LZR.Base.Math",
	"LZR.Node.Srv.Result",
	"LZR.Node.Srv.ComDbSrv"
]);

var utTim = LZR.getSingleton(LZR.Base.Time);
var utMath = LZR.getSingleton(LZR.Base.Math);
var clsR = LZR.Node.Srv.Result;

// 常用数据库
var cmdb = new LZR.Node.Srv.ComDbSrv ({
	logAble: 5
});
cmdb.initDb(
	(process.env.OPENSHIFT_MONGODB_DB_URL || "mongodb://localhost:27017/test"),
	"diary"
);

// 添加特殊的数据库查询
cmdb.mdb.crtEvt({
	rjCount: {
		tnam: "diary",
		funs: {
			count: [{"typ":1}]
		}
	},
	rjLimit: {
		tnam: "diary",
		funs: {
			find: [{"typ":1}, {"_id":0, "tim":1}],
			sort: ["<0>"],
			limit: [1],
			toArray: []
		}
	}
});
cmdb.mdb.evt.rjCount.add(function (r, req, res, next) {
	if (r) {
		req.qpobj.count = r;
		cmdb.mdb.qry("rjLimit", req, res, next, [{"tim":1}]);
	} else {
		res.json(clsR.get({count: 0}, "暂无数据", false));
	}
});
cmdb.mdb.evt.rjLimit.add(function (r, req, res, next) {
	if (req.qpobj.min === null) {
		req.qpobj.min = r[0].tim;
		cmdb.mdb.qry("rjLimit", req, res, next, [{"tim":-1}]);
	} else {
		req.qpobj.max = r[0].tim;
		res.json(clsR.get(req.qpobj));
	}
});

// 创建路由
var r = new LZR.Node.Router ({
	path: curPath,
	hd_web: "web"
});

// 解析 post 参数
r.use("*", bodyParser.urlencoded({ extended: false }));

// 获取总数和极值
r.post("/srvLimit/", function (req, res, next) {
	req.qpobj = {
		min: null
	};
	cmdb.mdb.qry("rjCount", req, res, next);
});

r.post("/srvGetRj/", function (req, res, next) {
	cmdb.get( req, res, next,
		{"tim":utMath.str2num(req.body.tim), "typ":1},
		{"_id":0}
	);
});

r.post("/srvMegRj/", function (req, res, next) {
	var t = utMath.str2num(req.body.tim);
	if (t) {
		var o = {}, b = false;
		if (req.body.txt) {
			b = true;
			o.content = req.body.txt;
		}
		if (req.body.title) {
			b = true;
			o.title = req.body.title;
		}
		if (b) {
			cmdb.meg(req, res, next, {"tim":t, "typ":1}, o);
		} else {
			res.json(clsR.get(0, "缺少内容", false));
		}
	} else {
		res.json(clsR.get(0, "缺少 tim", false));
	}
});

r.post("/srvQryRj/", function (req, res, next) {
	var s = utMath.str2num(req.body.stim);
	var e = utMath.str2num(req.body.etim);
	var q = {"typ": 1};
	if (s) {
		q.tim = {
			"$gte": s
		};
	}
	if (e) {
		if (!q.tim) {
			q.tim = {};
		}
		q.tim["$lte"] = e;
	}
	cmdb.qry( req, res, next,
		"tim", utMath.str2num(req.body.tim), q,
		{"_id": 0, "tim":1, "title":1}
	);
});

// r.post("/srvDelRj/", function (req, res, next) {
// 	cmdb.del( req, res, next,
// 		{"tim":utMath.str2num(req.body.tim), "typ":1}
// 	);
// });

/****************** 相亲 ********************/

r.post("/srvNamsXq/", function (req, res, next) {
	cmdb.get( req, res, next,
		{"typ":2},
		{"_id":0, "nam":1, "order":1, "metotal":1}
	);
	// req.body.size = 100;
	// req.body.sort = 1;
	// cmdb.qry( req, res, next,
	// 	"order", null, {"typ":2},
	// 	{"_id":0, "nam":1, "order":1, "metotal":1}
	// );
});

r.post("/srvInfoXq/", function (req, res, next) {
	cmdb.get( req, res, next,
		{"order": (req.body.od - 0), "typ":2},
		{
			"_id":0, "nam":1, "year":1, "zo":1, "tel":1, "op":1, "job":1,
			"order":1, "metotal":1, "meet.tim":1, "meet.txtim":1
		}
	);
});

r.post("/srvOneMeetXq/", function (req, res, next) {
	cmdb.get( req, res, next,
		{"order": (req.body.od - 0), "typ":2},
		{"_id":0, "nam":1, "meet":1}, true
	);
});
r.post("/srvOneMeetXq/", function (req, res, next) {
	var r = req.qpobj.comDbSrvReturn[0];
	var o = {
		nam: r.nam,
		meet: r.meet[(req.body.id - 0)]
	};
	res.json(clsR.get(o));
});

// 添加新人
// 修改基本信息
// 补充、修改约会信息

// 初始化模板
// r.initTmp();

module.exports = r;
