# Directive: Emergency & SOS Response Protocol

## Objective

Provide an unmistakable, ultra-reliable emergency assistance flow for attendees with immediate dispatch to organizers and security personnel.

## Emergency Categories

1. **Medical Emergency**: Sudden illness, injury, allergic reaction, cardiac event.
2. **Security & Safety**: Physical disturbance, suspicious activity, unauthorized intrusion.
3. **Lost Child / Separated Attendee**: Missing person report requiring rapid perimeter broadcast.
4. **Mobility / Evacuation Assistance**: Attendee requiring immediate wheelchair or escort support.

## Attendee SOS Flow

1. Attendee taps high-contrast, pulsating **"SOS / Emergency"** button (accessible from any screen).
2. Emergency Modal opens immediately with:
   - 1-tap dispatch for standard emergencies.
   - Live location detection (defaults to nearest zone or allows quick zone selector).
   - Instant shortest step-free route to the nearest First Aid station.
   - Direct emergency hotline links (`tel:` protocols for rapid dialing on mobile).
3. Upon dispatch submission:
   - Attendee receives an immediate visual confirmation with a unique incident reference code, estimated responder arrival time, and safety guidance.
   - High-priority incident is published to the Organizer Incident Management Console.

## Organizer Response Flow

1. Incident pops up in the Organizer Incident Console with audible alert chime and priority badge.
2. Organizer can review attendee location, reported issue, and timestamp.
3. Action buttons:
   - **"Dispatch Team"**: Updates status to _Responders En Route_, timestamped.
   - **"Mark Resolved"**: Closes the incident, records resolution details in event log.
