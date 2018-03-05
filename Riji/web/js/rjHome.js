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
	size: 10,
	sort: 0,
	ys: {},

	// 数据库访问工具
	db: new LZR.HTML.Srv.ComDbQry ({
		sort: -1,
		keyNam: "tim",
		url: {
			qry: "srvQryRj/"
		}
	}),

	// 数据库初始化
	initDb: function () {
		dat.db.pgs = dat.size;
		dat.db.mark.doe = document.getElementById("mark");
		dat.db.evt.qryb.add(function (o) {
			tbs.innerHTML = "";
			if (dat.stim) {
				o.stim = dat.stim;
				o.etim = dat.etim;
			}
		});
		dat.db.evt.qryr.add(function (o) {
			if (dat.stim) {
				dat.crtM(o);
			} else {
				for (var i = 0; i < o.length; i ++) {
					dat.show(o[i]);
				}
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
				dat.db.custExe = false;
				dat.busy = false;
				dat.db.first();
			} else {
				dat.db.showMark(false);
			}
		});
	},

	show: function (o) {
		var d = document.createElement("a");
		var s = o.timstr;
		if (!s) {
			timtmp.setTime(utTim.parseDayTimestamp(o.tim));
			s = utTim.format(timtmp, "date");
		}
		if (o.title) {
			s += " : " + o.title;
		}

		d.className = "rj_title";
		d.innerHTML = s;
		d.href = "rj.html?t=" + o.tim;
		d.target = "_blank";

		tbs.appendChild(d);
	},

	showY: function (y) {
		var o = dat.ys[y];
		if (o) {
			if (o.mdoe) {
				dat.sortM(o);
			}
		} else {
			var r = document.createElement("div");
			var d = document.createElement("a");
			d.className = "rj_y";
			d.innerHTML = y;
			d.href = "javascript: dat.setMenu(" + y + ", 0);";
			r.appendChild(d);
			o = {doe: r, txtDoe: d};
			dat.ys[y] = o;
		}
		doe_menu.appendChild(o.doe);
	},

	chgSort: function () {
		dat.db.sort *= -1;
		dat.crtY();
		dat.flush();
	},

	// 创建年容器
	crtY: function () {
		doe_menu.innerHTML = "";

		var i;
		if (dat.db.sort === -1) {
			for (i = dat.max; i >= dat.min; i --) {
				dat.showY(i);
			}
		} else {
			for (i = dat.min; i <= dat.max; i ++) {
				dat.showY(i);
			}
		}
	},

	// 创建月容器
	crtM: function (o) {
		var d = o[0];
		timtmp.setTime(utTim.parseDayTimestamp(d.tim));
		var y = timtmp.getFullYear();
		var r = dat.ys[y];
		dat.db.pgs = dat.size;
		dat.db.sort = dat.sort;
		if (r) {
			r.txtDoe.innerHTML += "<span class='rj_num'>(" + o.length + ")</span>";
			r.mdoe = document.createElement("div");
			r.mdoe.className = "rj_ms";
			r.p = 0;	// 分页位置
			r.s = 0,	// 起始位置
			r.e = o.length - 1;	// 结束位置
			r.ma = [];	// 年内所有数据
			r.ms = {};	// 分月信息

			if (o.length > dat.size) {
				dat.db.pgn = o[dat.size];
			}

			var i, m, mo = null;
			for (i = 0; i < o.length; i ++) {
				d = o[i];
				timtmp.setTime(utTim.parseDayTimestamp(d.tim));
				d.timstr = utTim.format(timtmp, "date");
				r.ma.push(d);
				m = timtmp.getMonth() + 1;
				if (!r.ms[m]) {
					// 数据部分
					if (mo) {
						mo.e = i - 1;	// 结束位置
						mo.txtDoe.innerHTML += "<span class='rj_num'>(" + (i - mo.s) + ")</span>";
					}
					mo = {
						doe: document.createElement("a"),
						p: 0,
						s: i,	// 起始位置
					};

					// 界面部分
					mo.doe.href = "javascript: dat.setMenu(" + y + "," + m + ");";
					mo.doe.className = "rj_m";
					d = document.createElement("div");
					d.className = "rj_mark";
					mo.doe.appendChild(d);
					d = document.createElement("div");
					d.className = "rj_txt";
					d.innerHTML = m + "月";
					mo.txtDoe = d;
					mo.doe.appendChild(d);

					r.ms[m] = mo;
				}
			}
			mo.e = i - 1;	// 结束位置
			mo.txtDoe.innerHTML += "<span class='rj_num'>(" + (i - mo.s) + ")</span>";
			r.doe.appendChild(r.mdoe);
			dat.sortM(r);

			dat.setMenu(y, 0);
		}
	},

	// 月容器排序
	sortM: function (y) {
		y.mdoe.innerHTML = "";

		var i, o;
		if (dat.db.sort === -1) {
			for (i = 12; i >= 1; i --) {
				if (y.ms[i]) {
					y.mdoe.appendChild(y.ms[i].doe);
				}
			}
		} else {
			for (i = 1; i <= 12; i ++) {
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
		} else if (!dat.ys[y].mdoe) {
			// 查询数据
			dat.stim = utTim.dayAreaStamp(y, 0);
			dat.etim = utTim.dayAreaStamp(y, 0, 1);
			dat.sort = dat.db.sort;
			dat.db.sort = -1;
			dat.db.pgs = 400;
			dat.db.first();
			return;
		}

		// 调整样式
		if (m !== dat.m) {
			if (dat.m) {
				dat.ys[dat.y].ms[dat.m].doe.className = "rj_m";
			}
			if (m) {
				dat.ys[y].ms[m].doe.className = "rj_m rj_msec";
			}
			dat.m = m;
		}

		if (y !== dat.y) {
			if (dat.y) {
				dat.ys[dat.y].doe.className = "";
			} else {
				doe_all.className = "";
			}
			if (y) {
				dat.ys[y].doe.className = "rj_ysec";
			} else {
				doe_all.className = "rj_ysec";
			}
			dat.y = y;
		}

		// 刷新显示
		dat.flush();
	},

	nextPag: function () {
		if (dat.y) {
			dat.pag(1);
		} else {
			dat.db.next();
		}
	},

	prePag: function () {
		if (dat.y) {
			dat.pag(-1);
		} else {
			dat.db.pre();
		}
	},

	flush: function () {
		if (dat.y) {
			dat.pag(0);
		} else {
			dat.db.pgs = dat.size;
			dat.db.first();
		}
	},

	// 处理分页
	pag: function (p) {
		tbs.innerHTML = "";
		var d = dat.ys[dat.y]
		var o, i, n, e, s, m;
		if (dat.m) {
			o = d.ms[dat.m];
		} else {
			o = d;
		}

		if (dat.db.sort === -1) {
			s = o.s;
			e = o.e;
			m = dat.size;
		} else {
			s = o.e;
			e = o.s;
			m = -dat.size;
		}

		if (p > 0) {
			if (Math.abs(e - o.p) >= dat.size) {
				o.p += m;
			}
		} else if (p < 0) {
			if (Math.abs(o.p - s) < dat.size) {
				o.p = s;
			} else {
				o.p -= m;
			}
		} else {
			o.p = s;
		}

		if (Math.abs(e - o.p) < dat.size) {
			dat.db.showBtn("nextNam", false);
		} else {
			dat.db.showBtn("nextNam", true);
		}
		if (Math.abs(o.p - s) < dat.size) {
			dat.db.showBtn("preNam", false);
		} else {
			dat.db.showBtn("preNam", true);
		}

		for (i = 0; i < dat.size; i ++) {
			n = o.p - i * dat.db.sort;
			if ((n - e) * dat.db.sort < 0) {
				break;
			} else {
				dat.show(d.ma[n]);
			}
		}
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
