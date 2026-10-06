# ElevenLabs generation list for the Flavor Race sound design.
# Each entry: name (SCENE_EVENT_LAYER), prompt (one clear sound), seconds, variations, loop, prompt_influence.
# Cost: 11 credits per generated second per variation (eleven_text_to_sound_v2).
A = [
 # 01 OPEN: mystery, microscopic
 ("01_OPEN_PLASTIC_TICK",      "Single tiny tick of cold hard plastic contracting, extremely close-mic, dry, quiet", 1.5, 2, False, 0.6),
 ("01_OPEN_FROST_CRACKLE",     "Fine ice crystals forming and crackling on a cold smooth surface, delicate, close-mic", 5, 1, False, 0.5),
 ("01_OPEN_DROPLET_PLINK",     "Single water droplet falling onto hard plastic, crisp clear plink, close-mic", 2, 2, False, 0.6),
 ("01_OPEN_STRUCTURE_GROAN",   "Distant enormous steel structure groaning slowly under cold stress, deep metallic creak, far away", 5, 2, False, 0.5),
 ("01_OPEN_CRYO_VENT_FAR",     "Distant pressurized cryogenic gas venting, soft steady hiss, far away outdoors at night", 6, 1, False, 0.4),
 ("01_OPEN_NIGHT_WIND",        "Wide open night wind over flat concrete, gentle gusts, faint distant metal cable pinging a pole", 15, 1, True, 0.4),
 ("01_OPEN_BIG_RELAY",         "One massive industrial electrical relay clunking shut, deep heavy metallic clunk, large space", 2, 2, False, 0.6),
 # 02 REVEAL: the lights
 ("02_REVEAL_RELAY_CHAIN",     "Large industrial electrical relays clacking shut one after another, metallic, echoing in a big space", 3, 2, False, 0.5),
 ("02_REVEAL_TRANSFORMER_RISE","Large electrical transformer powering up, deep hum rising with buzzing harmonics", 4, 2, False, 0.5),
 ("02_REVEAL_FLOOD_HIT",       "Giant stadium floodlight bank switching on, heavy electrical contactor slam, deep thump, buzzing arc", 3, 3, False, 0.5),
 ("02_REVEAL_LAMP_HUM",        "Steady electrical buzz and hum of powerful stadium floodlights at night", 10, 1, True, 0.4),
 ("02_REVEAL_SHIMMER_BLOOM",   "Soft crystalline shimmer blooming and swelling, glassy harmonic resonance", 4, 2, False, 0.5),
 ("02_PAD_VAPOR_HISS",         "Steady cryogenic vapor venting from a large tank, gentle continuous hiss with soft gurgle", 10, 1, True, 0.4),
 # 03 COMPETITOR and the plant
 ("03_RIVAL_ROUGH_IDLE",       "Rough heavy diesel engine idling unevenly, metallic rattle, low growl", 6, 2, False, 0.5),
 ("03_RIVAL_HYDRAULIC_GROAN",  "Old hydraulic system groaning and creaking under load, gritty", 3, 1, False, 0.5),
 ("03_PLANT_BOLT_RATTLE",      "Small loose steel bolt rattling against a metal panel from vibration, close-mic", 3, 2, False, 0.6),
 # 04 FLAVOR CONTROL
 ("04_CONTROL_ROOMTONE",       "1960s control room ambience, humming consoles, cooling fans, distant teletype, quiet", 15, 1, True, 0.4),
 ("04_CONTROL_READY_CHIME",    "Soft clean touchscreen confirmation chime, refined, glassy, short", 1.5, 2, False, 0.6),
 # 05 PRE-LAUNCH: the machine wakes
 ("05_PRE_PIPE_FLOW",          "Cryogenic propellant rushing through large steel pipes, deep flowing roar, pressure building", 6, 1, False, 0.5),
 ("05_PRE_TANK_PINGS",         "Large metal tank creaking and pinging as it cools rapidly, sharp metallic ticks", 4, 2, False, 0.5),
 ("05_PRE_VALVE_ACTUATE",      "Heavy pneumatic valve actuating, sharp hiss and solid metal clunk", 2, 2, False, 0.6),
 ("05_PRE_GAUGE_NEEDLE",       "Mechanical pressure gauge needle creaking, tiny clockwork ticks, close-mic", 3, 1, False, 0.5),
 ("05_PRE_TURBINE_THERA",      "Precise high-speed turbopump spinning up, clean smooth rising whine", 5, 2, False, 0.5),
 ("05_PRE_TURBINE_RIVAL",      "Rough heavy turbine spinning up with grinding metallic vibration, uneven", 5, 1, False, 0.5),
 ("05_PRE_TOWER_CREAK",        "Giant steel launch tower creaking and settling, deep metallic stress", 4, 1, False, 0.5),
 ("05_PRE_UMBILICAL_RELEASE",  "Heavy steel connector releasing with a loud pneumatic snap and a burst of cold gas", 2, 2, False, 0.6),
 ("05_PRE_IGNITER_SPARKS",     "Electric igniter sparking rapidly, sharp snapping electrical arcs", 2, 2, False, 0.6),
 ("05_PRE_BUTTON_PRESS",       "Heavy industrial push button pressed, deep solid mechanical click", 1, 2, False, 0.7),
 ("05_HUSH_RELAY_CLICK",       "Single small electrical relay click, dry, close", 0.8, 2, False, 0.7),
 # 06 LAUNCH
 ("06_LAUNCH_IGNITION_CRACK",  "Rocket engine ignition, violent sharp crack and burst of flame", 2, 3, False, 0.5),
 ("06_LAUNCH_ROAR_BODY",       "Massive rocket engine roar at full thrust, deep powerful continuous combustion", 10, 2, False, 0.5),
 ("06_LAUNCH_CRACKLE",         "Rocket exhaust crackle, sharp popping shock waves, outdoors", 8, 1, False, 0.5),
 ("06_LAUNCH_DEBRIS_RATTLE",   "Metal panels, loose grating and debris rattling violently from heavy vibration", 4, 2, False, 0.5),
 ("06_LAUNCH_GANTRY_SHAKE",    "Steel gantry shaking and resonating under intense vibration, deep metallic groan", 4, 1, False, 0.5),
 ("06_LAUNCH_ROAR_DISTANT",    "Rocket launch heard from miles away, deep rolling thunder-like rumble", 8, 1, False, 0.5),
 ("06_LAUNCH_STEAM_WALL",      "Huge wall of steam and air rushing past, dense muffled roar", 3, 1, False, 0.5),
 ("06_LAUNCH_TAIL",            "Long low rumble fading slowly like distant thunder", 6, 1, False, 0.4),
 # 07 ASCENT
 ("07_ASCENT_CLOUD_PUNCH",     "Fast object tearing through dense cloud, thick air rush and buffeting", 3, 1, False, 0.5),
 ("07_ASCENT_WIND_SHEAR",      "High altitude wind shear, thin whistling air rushing past at extreme speed", 5, 1, False, 0.5),
 # 08 SPACE
 ("08_SPACE_HULL_HUM",         "Low resonant hum transmitted through a metal hull, subtle vibration", 10, 1, True, 0.4),
 ("08_SPACE_ENGINE_CUTOFF",    "Large engine shutting down, rumble winding down to silence with a final hiss", 3, 2, False, 0.5),
 ("08_SPACE_METAL_TICKS",      "Hot metal cooling and ticking, small sharp pings, close", 4, 1, False, 0.5),
 ("08_SPACE_SERVO",            "Precise small servo motor adjusting, soft whir and click", 1.5, 2, False, 0.6),
 ("08_SPACE_RIVAL_COUGH",      "Engine coughing and sputtering once, rough misfire, muffled", 2, 2, False, 0.6),
 ("08_SPACE_RELIGHT",          "Engine reignition, soft igniter clicks then deep muffled whump and clean rising thrust", 3, 2, False, 0.5),
 # 09 RACE
 ("09_RACE_RIVAL_PASS",        "Rough heavy engine passing by fast, grinding roar with doppler", 3, 2, False, 0.5),
 ("09_RACE_THERA_THRUST",      "Smooth powerful clean engine thrust, steady refined roar", 6, 1, True, 0.4),
 # 10 LAB: future flavors
 ("10_LAB_CITRUS_SPLIT",       "Juicy citrus fruit splitting open, wet crisp tear", 1, 1, False, 0.6),
 ("10_LAB_PETALS",             "Soft flower petals fluttering in the air", 1, 1, False, 0.5),
 ("10_LAB_LEAVES",             "Fresh tea leaves rustling and tumbling", 1, 1, False, 0.5),
 ("10_LAB_SLICE",              "Crisp fresh cucumber sliced with a sharp knife", 1, 1, False, 0.6),
 ("10_LAB_MIST_SPRAY",         "Fine citrus oil mist spraying, delicate sparkling hiss", 2, 1, False, 0.5),
 ("10_LAB_DROP_GLASS",         "Single water drop falling into a glass dish, clear resonant plink with a gentle ring", 2, 2, False, 0.6),
 ("10_LAB_CRYSTAL_SING",       "Wet finger rubbing the rim of a crystal glass, pure singing tone", 4, 1, False, 0.6),
 ("10_LAB_AROMA_AIR",          "Soft swirling airy whoosh, gentle and delicate", 2, 1, False, 0.5),
 ("10_LAB_TWIST_LOCK",         "Precision metal cylinder twist-locking into place, smooth click and seal", 1.5, 2, False, 0.6),
 ("10_LAB_FROST_BLOOM",        "Cold vapor burst and frost crackling as it spreads across steel", 2, 1, False, 0.5),
 ("10_LAB_ROOMTONE",           "Quiet modern laboratory ambience, soft air handling, faint electronic hum", 10, 1, True, 0.4),
 ("10_LAB_LAUNCH_THOOMP",      "Pneumatic launcher firing, soft deep thoomp and rising whoosh", 2, 1, False, 0.5),
 # 11 FLAVOR RING
 ("11_RING_SPARKLE_PASS",      "Delicate glittering chimes passing by softly", 3, 1, False, 0.5),
 # 12 FAILURE
 ("12_FAIL_BOLT_UNSCREW",      "Bolt slowly unscrewing, metal threads squeaking and ratcheting", 2, 2, False, 0.6),
 ("12_FAIL_SPUTTER",           "Heavy engine sputtering and backfiring, unstable rough combustion", 3, 2, False, 0.5),
 ("12_FAIL_HULL_STRAIN",       "Metal hull straining and creaking under pressure, high-pitched groan", 3, 1, False, 0.5),
 ("12_FAIL_LEAK_HISS",         "High pressure gas leaking violently from a cracked pipe, harsh hiss", 3, 1, False, 0.5),
 ("12_FAIL_OVERPRESSURE_WHINE","Rising unstable mechanical whine about to fail, shrill", 2, 1, False, 0.5),
 ("12_FAIL_EXPLOSION_BODY",    "Huge muffled explosion, deep heavy boom with long rumbling tail", 4, 2, False, 0.5),
 ("12_FAIL_DEBRIS_PINGS",      "Small metal debris fragments pinging and tumbling", 3, 1, False, 0.5),
 ("12_FAIL_DRIFT_CREAK",       "Damaged metal object slowly rotating, faint creaks", 3, 1, False, 0.5),
 # 13 MOON
 ("13_MOON_THRUSTER_PUFFS",    "Small thruster bursts, short soft gas puffs", 3, 1, False, 0.5),
 ("13_MOON_TOUCHDOWN",         "Heavy landing gear compressing, hydraulic sigh and solid thump", 2, 2, False, 0.6),
 ("13_MOON_DUST_CRUNCH",       "Heavy foot pressing into fine powdery dust, soft crunch", 1.5, 1, False, 0.6),
 # 14 HOME
 ("14_HOME_REENTRY_PLASMA",    "Intense rushing roar of superheated air, buffeting and crackling", 4, 1, False, 0.5),
 ("14_HOME_EVENING_AMB",       "Calm summer evening ambience, distant birds, soft breeze in trees", 10, 1, True, 0.4),
 ("14_HOME_LANDING_THRUST",    "Rocket engine gently throttling down to land, settling rumble", 4, 1, False, 0.5),
 ("14_HOME_ENGINE_SPINDOWN",   "Turbine spinning down slowly to a stop, clean descending whine", 3, 1, False, 0.5),
 ("14_HOME_HATCH_OPEN",        "Small hatch unlatching and sliding open with a soft pneumatic hiss", 3, 2, False, 0.6),
 ("14_HOME_ROBOT_ARM",         "Small precise robotic arm extending, smooth servo whirs and soft clicks", 4, 2, False, 0.6),
 ("14_HOME_GLASS_CLINK",       "Small glasses gently clinking on a metal tray", 1.5, 2, False, 0.6),
 ("14_HOME_SERVO_HESITATE",    "Small servo motor hesitating with a tiny squeak, then a quick adjustment", 1.5, 2, False, 0.6),
 # 15 END and 16 POST
 ("15_END_CRYSTAL_TONE",       "Single pure crystal glass tone ringing out slowly", 5, 2, False, 0.6),
 ("16_POST_SCREW_TINK",        "Tiny metal screw tapping a glass lens, delicate tink", 1, 2, False, 0.7),
]
if __name__ == "__main__":
    secs = sum(d * v for _, _, d, v, _, _ in A)
    print(len(A), "sounds,", sum(v for *_, v, _, _ in [(a[0], a[1], a[2], a[3], a[4], a[5]) for a in A]), "generations,", secs, "seconds ->", round(secs * 11), "credits")
