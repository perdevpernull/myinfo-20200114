import {log} from "../../common/util/log";


// Creates a curved (diagonal) path from parent to the child node or between friend nodes
function calcPathWithDirs(sx, sy, sw, sh, tx, ty, tw, th, type, margo) {
	// arány a:b
	var a = 1, b = 2;
	var minBezDist = 60;
	var sourcePoint, c1Point, c2Point, targetPoint;

	if (type === "friend") {
		if (sx <= tx) {
			sx = sx + sw / 2;
			tx = tx - tw / 2;
			sourcePoint = `M ${sx},${sy} `;
			c1Point = `C ${sx + Math.max(minBezDist,b*Math.abs(sx-tx)/(a+b))},${sy} `;
			c2Point = `${tx - Math.max(minBezDist,b*Math.abs(sx-tx)/(a+b))},${ty} `;
			targetPoint = `${tx},${ty}`;
		} else {
			sx = sx - sw / 2;
			tx = tx + tw / 2;
			sourcePoint = `M ${sx},${sy} `;
			c1Point = `C ${sx - Math.max(minBezDist,b*Math.abs(sx-tx)/(a+b))},${sy} `;
			c2Point = `${tx + Math.max(minBezDist,b*Math.abs(sx-tx)/(a+b))},${ty} `;
			targetPoint = `${tx},${ty}`;
		};
	} else {
		if (type === "parent") {
			sx = sx - 2*margo;
			if (tw > 0)	{
				tx = tx + 2*margo;
			};
			sy = sy - sh / 2;
			ty = ty + th / 2;
			sourcePoint = `M ${sx},${sy} `;
			c1Point = `C ${(sx)},${sy - Math.max(minBezDist,b*Math.abs(sy-ty)/(a+b))} `;
			c2Point = `${tx},${ty + Math.max(minBezDist,b*Math.abs(sy-ty)/(a+b))} `;
			targetPoint = `${tx},${ty}`;
		} else if (type === "child") {
			sx = sx + 2*margo;
			if (tw > 0)	{
				tx = tx - 2*margo;
			};
			sy = sy + sh / 2;
			ty = ty - th / 2;
			sourcePoint = `M ${sx},${sy} `;
			c1Point = `C ${(sx)},${sy + Math.max(minBezDist,b*Math.abs(sy-ty)/(a+b))} `;
			c2Point = `${tx},${ty - Math.max(minBezDist,b*Math.abs(sy-ty)/(a+b))} `;
			targetPoint = `${tx},${ty}`;
		};
	};


	//log.DEBUG(`calcPathWithDirs(${sx},${sy},${sw},${sh},${tx},${ty},${tw},${th},${type},${margo})(${sourcePoint+c1Point+c2Point+targetPoint})`);
	return (sourcePoint+c1Point+c2Point+targetPoint);
};


export {calcPathWithDirs};
