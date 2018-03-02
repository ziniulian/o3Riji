// 访问管理

LZR.load([
	"LZR.HTML.Srv.ComDbQry",
	"LZR.Base.Time"
]);

var timtmp = new Date();	// 时间缓存
var utTim = LZR.getSingleton(LZR.Base.Time);
var dat = {
	min: 0,
	max: 0,
	y: 0,
	m: 0,
	stim: 0,
	etim: 0,
	ys: {},

	// 数据库访问工具
	db: new LZR.HTML.Srv.ComDbQry ({
		pgs: 10,
		sort: -1,
		keyNam: "tim",
		url: {
			qry: "srvQryRj/"
		}
	}),

	// 数据库初始化
	initDb: function () {
		dat.db.mark.doe = document.getElementById("mark");
		dat.db.evt.qryb.add(function (o) {
			tbs.innerHTML = "";
			if (dat.stim) {
				o.stim = dat.stim;
				o.etim = dat.etim;
			}
		});
		dat.db.evt.qryr.add(function (o) {
			for (var i = 0; i < o.length; i ++) {
				dat.show(o[i]);
			}
		});
		dat.db.evt.exer.add(function (o) {
			if (o.ok) {
				doe_num.innerHTML = "(" + o.dat.count + ")";
				timtmp.setTime(utTim.parseDayTimestamp(o.dat.min));
				dat.min = timtmp.getFullYear();
				timtmp.setTime(utTim.parseDayTimestamp(o.dat.max));
				dat.max = timtmp.getFullYear();
				dat.crtY();
				// dat.db.first();
			} else {
				dat.db.showMark(false);
			}
		});
	},

	show: function (o) {
console.log(o);
		/*var r = document.createElement("tr");
		var d = document.createElement("td");

		// 时间
		dat.timtmp.setTime(o.tim);
		// d.innerHTML = utTim.format(dat.timtmp, "yyyy-MM-dd hh:mm:ss:fff");
		d.innerHTML = utTim.format(dat.timtmp, "datetim");
		r.appendChild(d);

		// URL
		d = document.createElement("td");
		d.innerHTML = o.url;
		r.appendChild(d);

		// IP
		d = document.createElement("td");
		d.innerHTML = o.ip;
		r.appendChild(d);

		// ID
		d = document.createElement("td");
		d.innerHTML = o.uuid;
		r.appendChild(d);

		tbs.appendChild(r);*/
	},

	showY: function (y) {
		if (dat.ys[y]) {
			var o = dat.ys[y];
			if (o.mdoe) {
				dat.sortM(o);
			}
		} else {
			dat.ys[y] = {};
			var r = document.createElement("div");
			var d = document.createElement("a");
			d.className = "rj_y";
			d.innerHTML = y;
			d.href = "javascript: dat.setMenu(" + y + ", 0);";
			r.appendChild(d);
			dat.ys[y].doe = r;
		}
		doe_menu.appendChild(dat.ys[y].doe);
	},

	chgSort: function () {
		dat.db.sort *= -1;
		if (dat.db.sort === 1) {
			doe_sort.innerHTML = "旧到新";
		} else {
			doe_sort.innerHTML = "新到旧";
		}
		dat.crtY();
	},

	// 创建年容器
	crtY: function () {
		doe_menu.innerHTML = "";

		var i;
		if (dat.db.sort === 1) {
			for (i = dat.min; i <= dat.max; i ++) {
				dat.showY(i);
			}
		} else {
			for (i = dat.max; i >= dat.min; i --) {
				dat.showY(i);
			}
		}
	},

	// 月容器排序
	sortM: function (y) {
		y.mdoe.innerHTML = "";

		var i;
		if (dat.db.sort === 1) {
			for (i = 1; i <= 12; i ++) {
				if (y.ms[i]) {
					y.mdoe.appendChild(y.ms[i].doe);
				}
			}
		} else {
			for (i = 12; i >= 1; i --) {
				if (y.ms[i]) {
					y.mdoe.appendChild(y.ms[i].doe);
				}
			}
		}
	},

	// 设置菜单
	setMenu: function (y, m) {
		if (!y) {
			dat.stim = 0;
			dat.etim = 0;
			doe_all.className = "rj_ysec";
		} else {
			dat.stim = utTim.dayAreaStamp(y, m);
			dat.etim = utTim.dayAreaStamp(y, m, 1);
		}

		if (m !== dat.m) {
			if (dat.m) {
				dat.ys[dat.y].ms[dat.m].doe.innerHTML = "rj_m";
			}
			if (m) {
				dat.ys[y].ms[m].doe.innerHTML = "rj_m rj_msec";
			}
		}

		if (y !== dat.y) {
			if (dat.y) {
				dat.ys[dat.y].doe.innerHTML = "";
			} else {
				doe_all.className = "";
			}
			if (y) {
				dat.ys[y].doe.innerHTML = "rj_ysec";
			} else {
				doe_all.className = "rj_ysec";
			}
			dat.dy = y;
		}

		// dat.db.first();
	}

};

function init() {
	lzr_tools.getDomains("io_home");
	dat.initDb();

	dat.db.custExe = true;
	dat.db.showMark(true);
	dat.db.exeajx.post("srvLimit/", null, null, true);

	lzr_tools.trace();
}
