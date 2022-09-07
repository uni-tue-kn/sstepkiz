# Aggregator UI

An Angular application for the aggregator device of the SSteP-KiZ to read, display and upload sensor data.

## Troubleshooting

If the 'com' DataChannels won't open (e.g. no initial message from the therapist) and the aggregator backend is running,
check/disable your Firewall.

# Aggregator-UI Verwendung

Das Aggregator-UI kann über die Webadresse `localhost:4000` im Browser aufgerufen werden.
Sofern Sie nicht bereits angemeldet sind, werden Sie automatisch auf die Anmeldeseite weitergeleitet.
SindSie bereits angemeldet gelangen sie direkt zum Aggregator-UI Dashboard.


## Anmelden beim Aggregator-UI

Tragen Sie ihre Anmelde-Informationen auf der Anmeldeseite ein und bestätigen Sie diese.
Daraufhin folgt die Weiterleitung an ein das Aggregator-UI Dashboard.


## Aggregator-UI Dashboard

Über das Dashboard können die meisten Sensoren gestartet und konfiguriert werden.
Jedem (aktiven) Sensor ist dazu eine Komponente/Kachel zugeordnet, in der ggf. auch eine Darstellung einer Sensordaten erfolgt.


## EKG Sensor Komponente

Nachdem oben rechts der Sensor gestartet wurde, sollte vom Browser oben links ein Dialog aufploppen.
Dort sollte ein Gerät `Movesense XYZ` aufgelistet werden (XYZ ist dabei eine beliebige Nummer).
Dieses Gerät kann ausgewählt werden und Aufzeichnung der EKG Daten wird gestartet.

Wird kein Gerät im Dialogfeld angezeigt, besteht kein Haukontakt. Stellen sie sicher, dass der Sensor richtig sitzt oder prüfen Sie den Sensor wie in "Verbindungsaufbau nicht möglich" beschrieben.


## Eye-Tracking Komponente

Für das Eye-Tracking muss eine Kamera ausgewählt werden.
Die Eye-Tracking Kamera hat den Namen `IP Camera Bridge Plus` und sollte automatisch ausgewählt sein, sodass das Eye-Tracking direkt gestartet werden kann.

Sollte keine Kamera mit dem Namen `IP Camera Bridge Plus` angezeigt werden, wenden Sie sich an die Therapeuten.


## Bewegungssensoren Komponente

Die Bewegungssensoren werden extren gestartet, weshalb hier nichts zu tun ist.

# Movesense EKG-Sensor

Der Movesense Sensor wird zur EKG-Messung genutzt.


## Anlegen des Sensors

Die Befestigung des Sensors erfolgt durch einen Brustgurt.
Dieser sollte unterhalb des Brustmuskels auf der Haut getragen werden, sodass der Sensor mittig unter der Brust sitzt.
Für optimalen Hautkontakt können die Elektroden (schwarzes Material) im Gurt mit der feuchten Hand angefeuchtet werden.

## Verbindungsaufbau nicht möglich

Sollte der Sensor nicht im Aggregator-UI angezeigt werden, kann das an einer zu geringen Leitfähigkeit der Haut (=zu wenig Schweiß) liegen.
Zum Überprüfen der Leitfähigkeit, müssen beide Elektroden am Brustgurt mit feuchten Fingern wiederholt berührt oder gedrückt werden. Der Gurt kann dazu abgenommen werden.
Daraufhin sollte an der Vorderseite des Sensors eine kleine rote LED leuchten und der Sensor im Aggregator-UI erkannt werden.

Ist das nicht der Fall, ist die Batterie des Sensors leer.

## Batteriewechsel des Sensors

Für den Batteriewechsel wird eine CR 2025 3V Knopfzelle und eine Münze benötigt.
Der Movesense Sensor muss aus dem Brustgurt herausgepopt werden.
Auf der Rückseite des Sensors sind eine kreisförige Platte und eine Einkerbung erkennbar.
Mit einer Münze kann die Platte an der Einkerbung herausgehebelt werden, was die Batterie frei legt. Das Herauslösen ist teilweise schwerfällig.
Anschließend kann die alte Batterie durch eine neue ersetzt werden. Dabei ist zu beachten, dass sie die Kontakte im Sensor berührt und die glatte Seite (+) nach oben zeigt (also die Deckelplatte berührt).

Anschließend kann die Platte wieder draufgesetzt und festgedrückt werden.

Zum Prüfen der Batterie sollte erneut die LED des Sensors gepüft werden (in "Verbindungsaufbau nicht möglich" beschrieben).
