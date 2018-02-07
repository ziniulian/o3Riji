// 访问管理

LZR.load([
	"LZR.Base.Json",
	"LZR.HTML.Base.Ajax",
	"LZR.HTML.Util.DomTool",
	"LZR.Base.Time"
]);

var ajx = new LZR.HTML.Base.Ajax ();
var utJson = LZR.getSingleton(LZR.Base.Json);
var utTim = LZR.getSingleton(LZR.Base.Time);
var utDomTool = LZR.getSingleton(LZR.HTML.Util.DomTool);
var dat = {
	busy: false,
	pgs: 10,			// 分页个数
	pgd: null,		// 分页位置
	pg: 0,			// 当前页数

	timtmp: new Date(),	// 时间缓存

	doMark: function (b) {
		if (b) {
			mark.className = "mark";
		} else {
			if (dat.busy) {
				ajx.abort();
			}
			mark.className = "Lc_nosee";
		}
		dat.busy = b;
	},

	qryTim: function () {
		var s = utTim.getTim(stimDom.value + " 0:0");
		var e = utTim.getTim(etimDom.value + " 0:0") + 86399999;
		if (dat.pg === 0) {
			dat.pgd = [s];
		} else {
			e = dat.pgd[dat.pg];
		}
		return s + "/" + e + "/";
	},

	qry: function (op) {
		if (!dat.busy) {
			dat.doMark(true);
			var url;
			if (op) {
				dat.pg = 0;
				url = "srvQry/" + op + "/" + dat.qryTim();
			} else {
				url = "srvQry/" + (dat.pgs + 1) + "/" + dat.qryTim();
			}
			if (idDom.value) {
				url += idDom.value;
				url += "/";
			} else {
				url += "null/";
			}
			if (ipDom.value) {
				url += ipDom.value;
				url += "/";
			} else {
				url += "null/";
			}
			if (urlDom.value) {
				url += encodeURIComponent(urlDom.value);
			}
			tbs.innerHTML = "";
			ajx.get(url, true);
		}
	},

	hdqry: function (txt, sta) {
		var i, d, o, n;
		if (sta === 200) {
			d = utJson.toObj(txt);
			if (d.ok) {
				o = d.dat;
				if (o.length > dat.pgs) {
					n = dat.pgs;
					dat.pgd[dat.pg + 1] = o[dat.pgs].tim;
					utDomTool.setProByNam("nextDom", "className", "");
				} else {
					n = o.length;
					utDomTool.setProByNam("nextDom", "className", "Lc_hid");
				}
				if (dat.pg) {
					dat.pgd[dat.pg] = o[0].tim;
					utDomTool.setProByNam("preDom", "className", "");
				} else {
					utDomTool.setProByNam("preDom", "className", "Lc_hid");
				}
				for (i = 0; i < n; i ++) {
					dat.show(o[i]);
				}
			} else if (dat.pg) {
				dat.busy = false;
				dat.prePage();
				return;
			} else {
				utDomTool.setProByNam("nextDom", "className", "Lc_hid");
				utDomTool.setProByNam("preDom", "className", "Lc_hid");
			}
		}
		dat.doMark(false);
	},

	show: function (o) {
		var r = document.createElement("tr");
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

		tbs.appendChild(r);
	},

	prePage: function () {
		if (dat.pg) {
			dat.pg --;
		}
		dat.qry();
	},

	nextPage: function () {
		dat.pg ++;
		dat.qry();
	},

	reflush: function () {
		dat.pg = 0;
		dat.qry();
	},

	keyUp: function (e) {
		if (e.keyCode === 13) {		// 回车键
			dat.reflush();
		}
	},

	chgTim: function () {
		var t;
		switch (cycDom.value) {
			case "all":
				stimDom.value = "1985-06-17";
				etimDom.value = utTim.format(new Date(), "date2");
				break;
			case "d3":
				t = new Date(etimDom.value);
				stimDom.value = utTim.format(utTim.addHour(-48, t), "date2");
				break;
			case "w1":
				t = new Date(etimDom.value);
				stimDom.value = utTim.format(utTim.addHour(-144, t), "date2");
				break;
			case "m1":
				t = new Date(etimDom.value);
				t.setMonth(-1);
				stimDom.value = utTim.format(t, "date2");
				break;
			case "m3":
				t = new Date(etimDom.value);
				t.setMonth(-3);
				stimDom.value = utTim.format(t, "date2");
				break;
			case "m6":
				t = new Date(etimDom.value);
				t.setMonth(-6);
				stimDom.value = utTim.format(t, "date2");
				break;
			case "y1":
				t = new Date(etimDom.value);
				t.setFullYear(t.getFullYear() - 1);
				stimDom.value = utTim.format(t, "date2");
				break;
			default:	// now
				t = utTim.format(new Date(), "date2");
				stimDom.value = t;
				etimDom.value = t;
				break;
		}
		dat.reflush();
	},

	clear: function () {
		idDom.value = "";
		ipDom.value = "";
		urlDom.value = "";
		dat.reflush();
	}

};

function init() {
	lzr_tools.getDomains("io_home");
	ajx.evt.rsp.add(dat.hdqry);
	idDom.onkeyup = dat.keyUp;
	urlDom.onkeyup = dat.keyUp;
	ipDom.onkeyup = dat.keyUp;
	dat.chgTim();

	lzr_tools.trace();
}
