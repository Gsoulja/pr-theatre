import { gsap } from "gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { SplitText } from "gsap/SplitText";

// Registered once here so every move and beat gets the same plugins (GSAP's documented pattern).
gsap.registerPlugin(DrawSVGPlugin, SplitText);

export { gsap, SplitText };
