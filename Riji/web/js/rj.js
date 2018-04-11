
LZR.load([
	"LZR.HTML.Util.Url",
	"LZR.Base.Json",
	"LZR.HTML.Base.Ajax",
	"LZR.Base.Time"
]);
var utUrl = LZR.getSingleton(LZR.HTML.Util.Url);
var utTim = LZR.getSingleton(LZR.Base.Time);
var utJson = LZR.getSingleton(LZR.Base.Json);
var ajx = new LZR.HTML.Base.Ajax ();

var dat = {
	srv: "srvGetRj/",
	arg: ["tim"],
	req: null,

	hdDat: function (txt, sta) {
		if (sta === 200) {
			var d = utJson.toObj(txt);
			if (d.ok) {
				dat.show(d.dat);
			}
		}
	},

	show: function (dat) {
		var o = dat[0];
		timDoe.innerHTML = utTim.format(new Date(utTim.parseDayTimestamp(o.tim)), "date");
		txtDoe.innerHTML = o.content;
		if (o.title) {
			titleDoe.innerHTML = o.title;
		}
	},

	check: function () {
		var b = true;
		for (var i = 0; i < dat.arg.length; i ++) {
			if (dat.req[dat.arg[i]] === undefined) {
				b = false;
				break;
			}
		}
		return b;
	}
};

function init() {
	dat.req = utUrl.getRequest();
	if (dat.check(dat.req)) {
		ajx.evt.rsp.add(dat.hdDat);
		ajx.post(dat.srv, dat.req, null, true);
		lzr_tools.trace();
	}
}
