import { randomInt, scrypt, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { customAlphabet } from "nanoid";

const scryptAsync = promisify(scrypt);

// Adapted from hushline's gen_reply_slug() (crypto.py):
// 4 words drawn from a ~340-word list ≈ 34 bits of entropy.
// Combined with a unique Case ID, this is more than sufficient to prevent
// brute-force access given rate limiting on /api/check-in.
const WORDS = [
  "alarm","alley","amber","angel","ankle","apple","apron","armor","arrow","atlas",
  "azure","bacon","badge","bagel","baron","beach","beard","beast","bench","berry",
  "blade","blaze","blend","blink","bloom","boost","boxer","brave","brook","brush",
  "buddy","build","cabin","candy","cargo","cedar","chain","chalk","chaos","charm",
  "chess","chief","chord","civic","cider","clamp","clash","cliff","cloak","clone",
  "cloud","clown","cobra","cocoa","comet","coral","couch","craft","crane","creek",
  "crisp","crown","crush","cycle","daisy","dance","delta","derby","disco","dodge",
  "drift","drone","dunes","eagle","earth","ebony","elder","elite","ember","epoch",
  "fable","faith","fancy","feast","fiber","field","final","flash","fleet","flint",
  "flora","flute","focus","forge","forum","frame","frank","frost","fruit","fuzzy",
  "gamma","gauge","giant","glade","glass","glaze","gleam","globe","gloom","gloss",
  "glove","grace","grade","grain","grand","grant","grasp","graze","greet","grove",
  "guide","guild","gusto","haven","heart","honey","honor","horse","human","humor",
  "image","indie","inlet","ivory","jazzy","jewel","joint","judge","juice","jumbo",
  "karma","knife","lance","laser","latch","lemon","level","light","limit","linen",
  "logic","lunar","magic","major","maple","march","marsh","medal","media","merge",
  "metro","might","minor","model","month","moral","motor","mount","music","noble",
  "north","notch","novel","nurse","nymph","ocean","orbit","outer","oxide","ozone",
  "paint","panel","paper","patch","peace","pearl","peach","pilot","pixel","pivot",
  "place","plant","plaza","point","polar","power","press","pride","prime","prism",
  "probe","proud","proxy","pulse","quest","quote","radar","radio","raven","reach",
  "realm","rebel","remix","renew","reset","ridge","river","robot","rocky","rouge",
  "round","rover","royal","ruler","runes","rusty","salon","sandy","scout","serif",
  "shade","shape","share","sharp","sheep","shell","shift","shore","sigma","sight",
  "skill","slate","slick","smart","smile","solar","solid","sonic","space","spark",
  "speed","spike","spine","spoke","spray","squad","stage","stake","stamp","stark",
  "start","state","steel","steep","stern","stick","stock","stone","storm","strap",
  "straw","sword","table","tango","taste","teach","tense","terra","thorn","tiger",
  "timer","titan","toast","token","torch","total","tower","trail","trait","trend",
  "tribe","trick","tried","troop","trove","truly","trunk","trust","truth","tuner",
  "ultra","unity","upper","urban","valor","valve","vault","video","vigor","vinyl",
  "viral","vivid","vixen","voice","voter","water","wheat","wheel","white","wider",
  "windy","wired","witch","world","worth","xenon","yield","youth","zebra","zesty",
];

export function generatePassphrase(): string {
  return Array.from({ length: 4 }, () => WORDS[randomInt(WORDS.length)]).join(" ");
}

// Case IDs: 10 chars from a URL-safe alphabet. Shown to the reporter.
const nanoid = customAlphabet("ABCDEFGHJKLMNPQRSTUVWXYZ23456789", 10);

export function generateCaseId(): string {
  return nanoid();
}

// Scrypt hashing — passphrase is never stored in plaintext.
export async function hashPassphrase(passphrase: string): Promise<string> {
  const salt = randomInt(0xffffffff).toString(16).padStart(8, "0") +
               randomInt(0xffffffff).toString(16).padStart(8, "0");
  const hash = (await scryptAsync(passphrase, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}

export async function verifyPassphrase(
  passphrase: string,
  stored: string
): Promise<boolean> {
  const [salt, hashHex] = stored.split(":");
  if (!salt || !hashHex) return false;
  try {
    const storedHash = Buffer.from(hashHex, "hex");
    const derived = (await scryptAsync(passphrase, salt, 64)) as Buffer;
    return timingSafeEqual(storedHash, derived);
  } catch {
    return false;
  }
}
