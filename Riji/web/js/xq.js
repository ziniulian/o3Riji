
LZR.load([
	"LZR.Base.Json",
	"LZR.HTML.Base.Ajax"
]);

var utJson = LZR.getSingleton(LZR.Base.Json);
var ajx = new LZR.HTML.Base.Ajax ();

var dat = {
	od: null,
	md: [],
	defaultOrder: true,

	hdDat: function (txt, sta) {
		if (sta === 200) {
			var d = utJson.toObj(txt);
			if (d.ok) {
				var o = d.dat;
				dat.od = o;
				for (var i = 0; i < o.length; i ++) {
					o[i].doe = dat.crtDoe(o[i]);
					dat.md.push(i);
					var t = i - 1;
					for (var j = t; j >= 0; j --) {
						if (o[i].metotal > o[dat.md[j]].metotal) {
							t = dat.md[j];
							dat.md[j] = i;
							dat.md[j + 1] = t;
						} else {
							break;
						}
					}
				}
				dat.show(dat.defaultOrder);
			}
		}
	},

	crtDoe: function (o) {
		var d = document.createElement("a");
		d.className = "nam";
		d.innerHTML = o.nam + "<span class='tim'> ( " + o.metotal + " ) </span>";
		d.href = "xqInfo.html?id=" + o.order;
		return d;
	},

	show: function (t) {
		var i;
		tbs.innerHTML = "";
		if (t === 2) {
			for (i = dat.od.length - 1; i >= 0; i --) {
				tbs.appendChild(dat.od[i].doe);
			}
		} else if (t) {
			for (i = 0; i < dat.md.length; i ++) {
				tbs.appendChild(dat.od[dat.md[i]].doe);
			}
		} else {
			for (i = 0; i < dat.od.length; i ++) {
				tbs.appendChild(dat.od[i].doe);
			}
		}
	}
};

function init() {
	lzr_tools.getDomains("io_rj");
	ajx.evt.rsp.add(dat.hdDat);
	ajx.post("srvNamsXq/", null, null, true);
	lzr_tools.trace();
}
