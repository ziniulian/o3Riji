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
		{"order": utMath.str2num(req.body.od), "typ":2},
		{
			"_id":0, "nam":1, "year":1, "zo":1, "tel":1, "op":1, "job":1,
			"order":1, "metotal":1, "meet.tim":1, "meet.txtim":1
		}
	);
});

r.post("/srvInfoXq2/", function (req, res, next) {
	cmdb.get( req, res, next,
		{"order": utMath.str2num(req.body.od), "typ":2},
		{
			"_id":0, "nam":1, "year":1, "zo":1,
			"tel":1, "op":1, "job":1, "order":1
		}
	);
});

r.post("/srvInfoXq3/", function (req, res, next) {
	cmdb.get( req, res, next,
		{"order": utMath.str2num(req.body.od), "typ":2},
		{ "_id":0, "nam":1, "meet.tim":1, "meet.txtim":1 }
	);
});

r.post("/srvOneMeetXq/", function (req, res, next) {
	cmdb.get( req, res, next,
		{"order": utMath.str2num(req.body.od), "typ":2},
		{"_id":0, "nam":1, "meet":1}, true
	);
});
r.post("/srvOneMeetXq/", function (req, res, next) {
	var r = req.qpobj.comDbSrvReturn[0];
	var o = {
		nam: r.nam,
		meet: r.meet[utMath.str2num(req.body.id)]
	};
	res.json(clsR.get(o));
});

function crtXqObj (dat) {
	var o = {};
	var b = false;
	if (dat.nam) {
		o.nam = dat.nam;
		b = true;
	}
	if (dat.year) {
		o.year = utMath.str2num(dat.year);
		b = true;
	}
	if (dat.zo) {
		o.zo = dat.zo;
		b = true;
	}
	if (dat.op) {
		o.op = dat.op;
		b = true;
	}
	if (dat.job) {
		o.job = dat.job;
		b = true;
	}
	if (dat.tel) {
		o.tel = dat.tel.split("\n");
		b = true;
	}
	if (b) {
		return o;
	} else {
		return null;
	}
}

// 修改相亲对象基本信息
r.post("/srvSetBaseXq/", function (req, res, next) {
	if (req.body.od) {
		var cond = {"order": utMath.str2num(req.body.od), "typ":2};
		var o = crtXqObj(req.body);
		if (o) {
			cmdb.set( req, res, next, cond, {"$set": o});
		} else {
			res.json(clsR.get(0, "缺少参数", false));
		}
	} else {
		next();
	}
});
r.post("/srvSetBaseXq/", function (req, res, next) {
	cmdb.count( req, res, next, {"typ":2}, true);	// 获取总数
});
r.post("/srvSetBaseXq/", function (req, res, next) {
	// 新增相亲对象
	var od = req.qpobj.comDbSrvReturn + 1;
	var o = crtXqObj(req.body);
	if (o && o.nam) {
		o.order = od;
		o.typ = 2;
		o.metotal = 0;
		o.meet = [];
		cmdb.add( req, res, next, false, o);
	} else {
		res.json(clsR.get(0, "缺少姓名", false));
	}
});

// 添加约会信息
r.post("/srvAddMeetXq/", function (req, res, next) {
	if (req.body.od && req.body.tim) {
		cmdb.get( req, res, next,
			{
				"order": utMath.str2num(req.body.od),
				"typ": 2,
				"meet.tim": utMath.str2num(req.body.tim)
			}, {"_id":0, "order":1}, true
		);
	} else {
		res.json(clsR.get(0, "缺少序号和时间", false));
	}
});
r.post("/srvAddMeetXq/", function (req, res, next) {
	if (req.qpobj.comDbSrvReturn.length === 0) {
		var cond = {"order": utMath.str2num(req.body.od), "typ": 2};
		var o = { "tim": utMath.str2num(req.body.tim) };
		if (req.body.txtim) { o.txtim = utMath.str2num(req.body.txtim); }
		if (req.body.txt) { o.txt = req.body.txt; }
		cmdb.set( req, res, next, cond, {
			"$push": {
				"meet": {
					"$each": [o],
					"$sort": {"tim": 1}
				}
			},
			"$inc": {
				"metotal": 1
			}
		});
	} else {
		res.json(clsR.get(0, "时间重复", false));
	}
});

// 删除约会信息
r.post("/srvDelMeetXq/", function (req, res, next) {
	if (req.body.od && req.body.tim) {
		var t = utMath.str2num(req.body.tim);
		var cond = {"order": utMath.str2num(req.body.od), "typ": 2, "meet.tim": t};
		cmdb.set( req, res, next, cond, {
			"$pull": {
				"meet": {
					"tim": t
				}
			},
			"$inc": {
				"metotal": -1
			}
		});
	} else {
		res.json(clsR.get(0, "缺少序号和时间", false));
	}
});

// 修改约会信息
r.post("/srvSetMeetXq/", function (req, res, next) {
	if (req.body.od && req.body.tim) {
		var t = utMath.str2num(req.body.tim);
		var cond = {"order": utMath.str2num(req.body.od), "typ": 2, "meet.tim": t};
		var o = {};
		var b = false;
		if (req.body.txt) {
			o["meet.$.txt"] = req.body.txt;
			b = true;
		}
		if (req.body.txtim) {
			o["meet.$.txtim"] = utMath.str2num(req.body.txtim);
			if (!o["meet.$.txtim"]) {
				o = {"meet.$" : {"tim": t}};
			}
			b = true;
		}
		if (b) {
			cmdb.set( req, res, next, cond, { "$set": o });
		} else {
			res.json(clsR.get(0, "缺少参数", false));
		}
	} else {
		res.json(clsR.get(0, "缺少序号和时间", false));
	}
});

// 初始化模板
// r.initTmp();

module.exports = r;
