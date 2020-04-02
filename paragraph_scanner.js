const request = require('request')

function getTranslation(srcLang, dstLang) {
    return function(word) {
        const path = `http://linguee-api.herokuapp.com/api?q=${word}&src=${srcLang}&dst=${dstLang}`
    
        return new Promise((resolve, reject) => {
            request(path, { json: true }, (err, res, body) => {
                if(err) return reject(err)
    
                if(!body.exact_matches) {
                    return resolve(null)
                }

                const questions = []
                body.exact_matches.forEach(match => {
                    const sourceWord = {
                        text: match.text,
                        wordType: match.word_type.pos,
                        language: srcLang,
                        translatedTo: dstLang
                    }
    
                    const translations = []
                    match.translations.forEach(translation => {
                        if(translation.featured) {
                            translations.push(translation.text)
                        }
                    })
    
                    questions.push({
                        sourceWord,
                        translations
                    })
    
                })
                resolve(questions)
            })
        })
    }
}
const enToDe = getTranslation('en', 'de')
const deToEn = getTranslation('de', 'en')

const XRegExp = require('xregexp')

const words = scan(`Warum Schweden in der Pandemie einen anderen Weg geht
Fast 5000 bestätigte Infektionen, 239 Tote durch das Coronavirus – und noch immer fährt Schweden einen moderaten Kurs. Versuch einer Erklärung. SVEN LEMKEMEYER
Ein gut besuchtes Cafe in Stockholm am 27. März.Mehr Artikel
Ein gut besuchtes Cafe in Stockholm am 27. März.FOTO: HENRIK MONTGOMERY/TT NEWS AGENCY/VIA REUTERS
Keine Kontaktsperre, Bars und Restaurants geöffnet, Kindertagesstätten und Grundschulen in Betrieb: In allen anderen Ländern Europas und vielen Staaten der Welt wird wegen der Ausbreitung des Coronavirus durch Gesetze und Verordnungen massiv in den Alltag der Bürger eingegriffen. Freiheitsrechte sind zum Teil deutlich eingeschränkt. Das sonst so sicherheitsbewusste Schweden scheint in der Pandemie vieles anders zu machen.

Die Regierung hat zwar inzwischen ein paar Restriktionen erlassen, aber die sind vergleichsweise moderat. Damit geht das Land auch einen anderen Weg als die Nachbarländer Norwegen oder Dänemark. In Stockholm belässt man es weitgehend bei Appellen an das Verantwortungsbewusstsein jedes Einzelnen.

[Verfolgen Sie in unseren Liveblogs die aktuellen Entwicklungen zum Coronavirus in Berlin und zum Coronavirus weltweit.]

Skandinavisch cool finden das die einen. Naiv und die Gesundheit der Bürger gefährend die anderen. Aber: „Niemand weiß, was derzeit richtig und was falsch ist“, sagt auch der Soziologe Fredrik Liljeros von der Universität in Stockholm.


Wie ist die Lage wegen des Coronavirus in Schweden?

Stand Mittwochnachmittag verzeichnete Schweden offiziellen Angaben zufolge 4947 bestätigte Infektionen, 239 Menschen sind bisher an den Folgen einer Coronavirus-Erkrankung verstorben, das sind 59 mehr als am Tag zuvor. Die Behörden betonen, dass es sich nicht um einen Anstieg binnen 24 Stunden handelt, sondern auch nachgemeldete Fallzahlen einflössen.


Die meisten Toten gibt es mit 103 im Großraum Stockholm, wo – je nach Definition – rund zwei Millionen Menschen leben. Insgesamt wurden oder werden 512 Patienten intensivmedizinisch behandelt.

Wie verhält sich die schwedische Regierung in der Corona-Krise?

Die rot-grüne Regierung des sozialdemokratischen Ministerpräsidenten Stefan Löfven vertraut voll auf die Empfehlungen der Wissenschaftler – und auf das Volk. Beinahe täglich bittet man die Schweden, soziale Kontakte zu minimieren, unnötige Reisen zu unterlassen, persönliche Schutzmaßnahmen wie häufiges Händewaschen einzuhalten und besonders ältere Mitbürger zu schützen.

Erstmals richtete sich Löfven auch in einer vom Fernsehen übertragenen Rede an die Nation. „Wir haben eine allgemeine Verbreitung des Virus in Schweden. Das Leben, die Gesundheit und der Arbeitsplatz sind gefährdet. Es werden mehr Menschen krank werden, mehr werden sich von Angehörigen verabschieden müssen.“


Dieser Auftritt und auch spätere Äußerungen des Premiers verdeutlichten, dass die Regierung sehr auf die spezielle schwedische Kultur setzt, die Bekämpfung der Krise zu einer Mentalitätsfrage macht. „Unsere Gesellschaft ist stark“, sagte Löfven. „Der einzige Weg“ im Kampf gegen die Epidemie bestehe darin, „die Krise als eine Gesellschaft anzugehen, in der alle Verantwortung für sich selbst, für die anderen und für unser Land übernehmen“. Der Premier weiß, dass die breite Masse der Schweden im Gegensatz zu vielen anderen Ländern noch immer Vertrauen in die Politik hat.

[Wenn Sie alle aktuellen Entwicklungen zur Coronavirus-Krise live auf ihr Handy haben wollen, empfehlen wir Ihnen unsere runderneuerte App, die Sie hier für Apple-Geräte herunterladen können und hier für Android-Geräte.]

Löfven bekommt für seinen Kurs Zustimmung. In der vergangenen Woche gingen einer Umfrage zufolge 56 Prozent der Bürger davon aus, dass Schweden die Krise gut oder sehr gut bewältigen werde. Und das, obwohl zu diesem Zeitpunkt schon klar war, dass die Krise auch die schwedische Wirtschaft massiv treffen wird.

Am vergangenen Freitag wiederholte Löfven: „Wir alle müssen als Individuen unsere Verantwortung übernehmen“, und fügte hinzu: „Wir können nicht alles gesetzlich regeln und verbieten.“ Allerdings betont der Ministerpräsident auch stets, dass die Bürger darauf gefasst sein müssten, dass es zu weiteren Einschränkungen im Alltag kommen könnte. Denn in der Regierungsstrategie findet sich noch ein Zusatz: Gegen das Coronavirus sollten „zur richtigen Zeit die richtigen Maßnahmen“ ergriffen werden.

Wer berät die schwedische Regierung im Kampf gegen Corona?

Einer der einflussreichsten Menschen in Schweden dürfte zurzeit der Staatsepidemiologe Anders Tegnell sein, der oberste Seuchenbekämpfer der Gesundheitsbehörde.

Der schwedische Ministerpräsident Stefan Löfven.Mehr Artikel
Der schwedische Ministerpräsident Stefan Löfven.FOTO: JONATHAN NACKSTRAND/AFP
Wie sein deutscher Kollege Lothar Wieler vom Robert-Koch-Institut informiert er beinahe täglich – live im Fernsehen übertragen – die Öffentlichkeit über die neusten Entwicklungen und stellt sich den Fragen nationaler und internationaler Medien.

Aber Tegnell ist anders. Sein deutscher Kollege Wieler wirkt mit Anzug und Krawatte eher staatstragend und seine Worte enthalten oft auch eine Portion Dramatik. Tegnell betont in seinen Wollpullovern und Jeans sowie seiner fast leisen Stimme das Bild und die Rolle des Wissenschaftlers.

Wie fast alle seine Kollegen unterstreicht Tegnell, wie wichtig es sei, die Ausbreitung des Coronavirus zu verlangsamen. Damit würde das Gesundheitssystem nicht überlastet und es stünden ausreichend Betten auf den Intensivstationen des Landes mit Beatmungsgeräten zur Verfügung.


Doch Tegnell sagt auch: „Wir sind auf dem richtigen Weg.“ Sogar als die Zahlen in Schweden in der vergangenen Woche erstmals deutlich nach oben gingen, sagte der 63-Jährige weiter: „Wir haben in Schweden eine stabile Situation.“ Die Situation im Land werde genau beobachtet, die Maßnahmen dementsprechend angepasst.

„Pandemie lässt sich nur durch Impfung und Herdenimmunität stoppen“

Tegnell geht davon aus, dass durch die ergriffenen Maßnahmen und das wärmere Wetter die Viruserkrankungen im Frühjahr und Sommer zurückgehen. Nach dem Rückgang werde der Erreger im Herbst wiederkehren, sagte er im schwedischen Fernsehen. „Wichtig wird dann sein, wie stark die Bevölkerung bis dahin infiziert wurde.“ Die Pandemie könne „nur durch Herdenimmunität oder einer Kombination von Immunität und Impfung“ gestoppt werden. Dies sei im Grunde dasselbe. Einen Impfstoff werde es nur mit viel Glück bereits im nächsten Jahr geben, vermutet Tegnell.

Der Staatsepidemiologe Anders Tegnell.Mehr Artikel
Der Staatsepidemiologe Anders Tegnell.FOTO: JONATHAN NACKSTRAND/AFP
Am Mittwoch sagte der Wissenschaftler in Stockholm, man sei jetzt in einer Situation wie in der vergangenen Woche, als man dachte, dass die Kurve steil nach oben gehen würde. „Das haben wir bis jetzt noch nicht gesehen.“ Es handele sich immer noch um eine relativ flache Kurve, aber man habe jetzt einen Anstieg. „Wir sollten dies als Erinnerung daran nehmen, dass wir an unseren Grundsätzen festhalten müssen: nicht zur Arbeit zugehen, wenn man krank ist und definitiv nicht ältere Angehörige zu besuchen.“

Rückendeckung für seine Einschätzungen erhält Tegnell von seinem Vorgänger. Johan Giesecke, emeritierter Professor vom Stockholmer Karolinska Institut. Er berät die Weltgesundheitsorganisation über Infektionskrankheiten und war von 1995 bis 2005 oberster staatlicher Epidemiologe in Schweden.


Auch Giesecke glaubt, dass die Infektionsrate schon im Mai deutlich zurückgehen, werde. Der „Spiegel“ berichtet, auf die Frage, was ihn so sicher mache, habe er via E-Mail geantwortet: „Das sagt mir mein Bauchgefühl.“ Das Blatt zitiert Giesecke weiter: „Ja, wir sind auf einem Sonderweg.“ Aber das Problem hätten nicht die Schweden, sondern die anderen: „In fast allen EU-Staaten hielten es die Politiker für nötig, Stärke zu zeigen, und sie haben eine Reihe von Beschränkungen eingeführt, für die es bloß eine sehr geringe wissenschaftliche Grundlage gibt.“

Welche Maßnahmen haben die Schweden bisher gegen das Coronavirus ergriffen?

Kindergärten und Grundschulen bis zur neunten Klasse sind anders als Gymnasien und Unis weiter offen, dort gibt es digitalen Unterricht. Auch Restaurants, Kneipen und Cafés sind weiter geöffnet, dürfen ihre Gäste seit kurzem aber nur noch am Tisch bedienen. Die Staatsgrenzen sind für Nicht-Europäer dicht, nicht aber für Bürger der EU und der Europäischen Freihandelszone. Die Behörden fordern alle auf, Abstand zu halten, nach Möglichkeit im Home Office zu arbeiten und auf keinen Fall zur Arbeit zu gehen, wenn man auch nur die geringsten Krankheitssymptome spürt.

Es gibt den immer wiederkehrenden Appell, soziale Kontakte zu minimieren und nicht zwingende Veranstaltungen und Reisen zu verschieben. Wirklich verboten sind seit Freitag aber nur Versammlungen mit mehr als 50 Teilnehmern – bis dahin lag die Grenze bei 500 Teilnehmern.


Das hatte unter anderem dazu geführt, dass in Skigebieten wie Åre bis vor kurzem noch bis zu 499 Menschen pro Veranstaltung kräftig Après-Ski feierten, obwohl schon lange bekannt war, dass das Skigebiet Ischgl in Tirol ein Epizentrum des Virus in Europa war. Die Bars in den beliebten schwedischen Wintersportorten schlossen, doch Skifahren war weiter möglich.

Jetzt schließen große Skigebiete vor den Osterferien. Der Betreiber Skistar teilte mit, dass die Saison in den Anlagen in Sälen, Vemdalen und Åre am 6. April vorzeitig beendet werde. Damit folge man dem Rat der Behörden, um zu verhindern, dass das Gesundheitssystem überlastet wird. Andere Resorts wie Riksgränsen im Norden Schwedens, die nicht zu Skistar gehören, sind weiter geöffnet. In Norwegen wurde die Schließung der Skistar-Gebiete bereits am 12. März angeordnet.

Hintergrund-Informationen zum Coronavirus:
Interaktive Karte: Alle bestätigten Coronavirus-Infektionen nach Landkreisen und Bundesländern
Senat beschließt Kontaktbeschränkungen: Was jetzt noch in Berlin erlaubt ist
Schließungen, Hotlines, Anlaufstellen: Das müssen Sie wissen, hier bekommen Sie in Berlin Hilfe
Am Coronavirus erkrankt oder nur Schnupfen? Was man über die Symptome weiß
Tag für Tag: Auf unserer interaktiven Karte sehen Sie, wie sich das Virus global ausgebreitet hat
Seit Dienstag wird in Schweden die Ausgabe von Medikamenten rationiert. Verboten sind seit Mittwoch auch Besuche in Pflegeheimen: „Wir müssen gemeinsam alles tun, was wir können, um die Ansteckungen von den Altenheimen fernzuhalten“, sagte Sozialministerin Lena Hallengren.

Wie umstritten ist der schwedische Kurs gegen die Ausbreitung des Coronavirus?

Die immer noch vergleichsweise freizügige Linie bekommt nicht nur Zuspruch. In Internetforen gibt es heftige Debatten, auch die Medien, in denen das Coronavirus das alles beherrschende Thema ist, werten die Situation in Meinungsbeiträgen durchaus unterschiedlich.

Mehrere hochrangige Wissenschaftler forderten die Behörden kürzlich in einem offenen Brief zum Kurswechsel auf. Die Regierung müsse den Kontakt zwischen den Menschen im Land deutlich einschränken und viel mehr testen, hieß es. Alle Schulen und Restaurants sollten schließen, bis man mehr über die Situation wisse.

„Wir sind eines der Länder der Welt, die die schwächsten Maßnahmen eingeführt haben“, monierte der Molekularbiologe Sten Linnarsson vom Stockholmer Karolinska-Institut in der Zeitung „Dagens Nyheter“. Wie die weiteren Unterzeichner des Briefes wolle er letztlich nur, dass Schweden so wie andere Länder internationalen Empfehlungen – etwa von der Weltgesundheitsorganisation WHO – folge.`)

let wordsArr = (function() {
    const arr = []
    for(const word in words) {
        arr.push(word)
    }
    return arr
})()

// Promise.all([enToDe('complete'), enToDe('test'), enToDe('friend')]).then(value => console.log(value))

// console.log(wordsArr)

// wordsArr = wordsArr.slice(0, 10)

const promises = []

function run(counter = 0) {
    if(counter > wordsArr.length - 1) {
        Promise.all(promises).then(value => console.log(value))
        return
    }
    promises.push(deToEn(wordsArr[counter]))
    setTimeout(() => run(++counter), 100)
}
run()


// Promise.all(wordsArr.map(word => deToEn(word))).then(value => console.log(value))

// enToDe('complete').then(value => console.log(value))

function scan(input) {
    const regex = XRegExp("[^\\s\\p{Latin}]+", "g");
    input = XRegExp.replace(input, regex, '')
    input = input.replace(/\r?\n|\r/g, ' ')

    // input = input.replace(/[^a-zA-Z ]/gi,'').replace(/\r?\n|\r\s\s+/g, ' ').replace();

    const words = input.split(' ')
    const uniqueWords = {}

    for(const word of words) {
        uniqueWords[word] = uniqueWords[word] + 1 || 1
    }

    return uniqueWords
}