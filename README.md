# Garmin G5 flight instrument simulator

An interactive Garmin G5 electronic flight instrument, built in React.

The PFD page is reproduced layer by layer: attitude with a 2.5° pitch ladder
and roll scale, moving airspeed and altitude tapes with colour bands and
V-speed bugs, vertical speed, heading, course deviation, turn rate, and the
annunciations for sensor failure, alignment and battery state. The bezel works
too -- the power button and the knob, with the G5's three-key soft menu.

Everything on the screen is driven by a small flight model, so the values are
genuinely coupled rather than independently posed.

## Development

The project is a pretty stock create-react-app app.

1. Use the Node version in `.nvmrc` (`nvm use`)
2. Install dependencies with `npm install`
3. Start development server with `npm start`

Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

Other scripts:

- `npm test` runs the tests in watch mode
- `npm run build` builds the app for production into `build`
- `npm run format` formats the project with prettier
- `npm run deploy` publishes `build` to GitHub Pages

## How it is put together

**One SVG scene graph.** The screen is a single `<svg>` on a 960x720 grid --
the G5's real 320x240 display at 3x -- with one `<g>` per layer under
`src/G5/Screen/layers`. The 4:3 aspect is locked and one scale factor covers
every display size.

**Geometry is measured, not estimated.** Every constant in
`src/G5/config/layout.js` was read off the reference figures in the G5 pilot's
guide: 11.04 grid pixels per degree of pitch, a roll arc of radius 262 centred
on the aircraft symbol, 12 pixels per knot, 1.8 pixels per foot (which gives
exactly the 400 feet of altitude the guide specifies). That file records the
full set.

**Nothing re-renders while flying.** The model ticks on motion's frame loop
outside React and writes into motion values, which drive SVG attributes
directly through the hooks in `src/G5/hooks`. React state holds only discrete
settings. The one exception is the tapes, whose tick lists are rebuilt when
the visible window shifts.

**Values chase their targets through a critically damped filter**, so the
tapes slew like an instrument instead of easing like a UI animation.

### The flight model

`src/G5/sim/flightModel.js` is kinematics, not aerodynamics, but it is honest
about energy, which is what makes the instrument read correctly:

- **The aircraft does not fly where it points.** Flight path angle is pitch
  attitude minus angle of attack, and angle of attack rises with the square of
  how far below trim speed you are, and with load factor in a turn. Pull the
  power and you descend, even holding level pitch.
- **Energy is conserved.** Specific excess power splits between climbing and
  accelerating. Whatever the pitch attitude asks for in climb that thrust
  cannot pay for comes out of airspeed.

Stalling falls out of this rather than being special-cased: hold the nose up
at idle, the speed decays, the angle of attack climbs, and the wing lets go at
the profile's Vs1 -- after which the nose drops on its own. The stall angle is
derived from the aircraft profile, so it tracks whatever Vs1 that profile
declares.

The aircraft profile in `src/G5/config/aircraft.js` supplies the V-speeds,
colour band boundaries and units. One C172-class profile ships; the shape is
open for more.

## Tests

Automated tests cover the parts that go silently wrong rather than visibly
wrong: tape and tick maths, colour band geometry, heading wrapping, the
energy model and the stall, the autopilot's capture behaviour, and battery
state.
