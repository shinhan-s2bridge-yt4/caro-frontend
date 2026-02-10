import WidgetKit
import SwiftUI

// MARK: - Data Model

struct SimpleEntry: TimelineEntry {
    let date: Date
    let totalDistanceKm: Double
    let pendingPoints: Int
    let progressRatio: Double
}

// MARK: - Timeline Provider

struct CaroProvider: TimelineProvider {
    private let appGroupId = "group.com.caro.app.yhjyhw"

    func placeholder(in context: Context) -> SimpleEntry {
        SimpleEntry(
            date: Date(),
            totalDistanceKm: 153.7,
            pendingPoints: 153,
            progressRatio: 0.38
        )
    }

    func getSnapshot(in context: Context, completion: @escaping (SimpleEntry) -> Void) {
        let entry = readEntry()
        completion(entry)
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<SimpleEntry>) -> Void) {
        let entry = readEntry()
        let nextUpdate = Calendar.current.date(byAdding: .minute, value: 15, to: Date())!
        let timeline = Timeline(entries: [entry], policy: .after(nextUpdate))
        completion(timeline)
    }

    private func readEntry() -> SimpleEntry {
        let defaults = UserDefaults(suiteName: appGroupId)
        let distance = defaults?.double(forKey: "totalDistanceKm") ?? 0.0
        let points = defaults?.integer(forKey: "pendingPoints") ?? 0
        let progress = defaults?.double(forKey: "progressRatio") ?? 0.0
        return SimpleEntry(
            date: Date(),
            totalDistanceKm: distance,
            pendingPoints: points,
            progressRatio: min(max(progress, 0.0), 1.0)
        )
    }
}

// MARK: - Widget View

struct CaroWidgetEntryView: View {
    var entry: SimpleEntry

    // Colors
    private let primaryBlue = Color(red: 72/255, green: 128/255, blue: 237/255)  // #4880ED
    private let darkBg = Color.white                                              // #FFFFFF
    private let trackGray = Color(red: 219/255, green: 220/255, blue: 223/255)    // #DBDCDF
    private let coinYellow = Color(red: 254/255, green: 184/255, blue: 2/255)     // #FEB802

    private var distanceText: String {
        if entry.totalDistanceKm < 0.1 {
            let meters = Int(entry.totalDistanceKm * 1000)
            return "\(meters)"
        } else {
            return String(format: "%.1f", entry.totalDistanceKm)
        }
    }

    private var distanceUnit: String {
        entry.totalDistanceKm < 0.1 ? "m" : "km"
    }

    var body: some View {
        ZStack {
            darkBg

            VStack(spacing: 8) {
                // Top card: distance + points + progress
                VStack(spacing: 8) {
                    HStack {
                        // Distance
                        HStack(alignment: .firstTextBaseline, spacing: 4) {
                            Text(distanceText)
                                .font(.system(size: 28, weight: .bold, design: .default))
                                .foregroundColor(.black)
                            Text(distanceUnit)
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.black.opacity(0.7))
                        }

                        Spacer()

                        // Points badge
                        HStack(spacing: 4) {
                            // Coin circle
                            ZStack {
                                Circle()
                                    .fill(coinYellow)
                                    .frame(width: 18, height: 18)
                                Text("C")
                                    .font(.system(size: 10, weight: .bold))
                                    .foregroundColor(.white)
                            }
                            Text("\(entry.pendingPoints)P \u{BC1B}\u{AE30}")
                                .font(.system(size: 13, weight: .semibold))
                                .foregroundColor(.white)
                        }
                        .padding(.horizontal, 10)
                        .padding(.vertical, 6)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(primaryBlue)
                        )
                    }

                    // Progress bar
                    GeometryReader { geo in
                        ZStack(alignment: .leading) {
                            RoundedRectangle(cornerRadius: 3)
                                .fill(trackGray)
                                .frame(height: 6)
                            RoundedRectangle(cornerRadius: 3)
                                .fill(primaryBlue)
                                .frame(width: max(geo.size.width * entry.progressRatio, 6), height: 6)
                        }
                    }
                    .frame(height: 6)
                }
                .padding(12)
                .background(
                    RoundedRectangle(cornerRadius: 14)
                        .fill(Color.white)
                )

                // CTA button
                Link(destination: URL(string: "caro://home")!) {
                    Text("\u{C624}\u{B298}\u{B3C4} \u{C6B4}\u{D589} \u{AE30}\u{B85D}\u{C744} \u{C2DC}\u{C791}\u{D574}\u{BCFC}\u{AE4C}\u{C694}?")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding(.vertical, 12)
                        .background(
                            RoundedRectangle(cornerRadius: 12)
                                .fill(primaryBlue)
                        )
                }
            }
            .padding(.top, 14)
            .padding(.bottom, 20)
            .padding(.horizontal, 20)
        }
        .widgetURL(URL(string: "caro://home"))
    }
}

// MARK: - Small Widget View (1x1)

struct CaroSmallWidgetEntryView: View {
    var entry: SimpleEntry

    private let primaryBlue = Color(red: 72/255, green: 128/255, blue: 237/255)
    private let coinYellow = Color(red: 254/255, green: 184/255, blue: 2/255)
    private let subtitleGray = Color(red: 152/255, green: 155/255, blue: 162/255)  // #989BA2

    private var distanceText: String {
        if entry.totalDistanceKm < 0.1 {
            let meters = Int(entry.totalDistanceKm * 1000)
            return "\(meters)"
        } else {
            return String(format: "%.1f", entry.totalDistanceKm)
        }
    }

    private var distanceUnit: String {
        entry.totalDistanceKm < 0.1 ? "m" : "km"
    }

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Label
            Text("\u{D604}\u{C7AC} \u{C6B4}\u{D589}\u{AC70}\u{B9AC}")
                .font(.system(size: 13, weight: .medium))
                .foregroundColor(subtitleGray)

            Spacer().frame(height: 8)

            // Distance
            HStack(alignment: .firstTextBaseline, spacing: 4) {
                Text(distanceText)
                    .font(.system(size: 32, weight: .bold))
                    .foregroundColor(.black)
                Text(distanceUnit)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.black.opacity(0.7))
            }

            Spacer()

            // Points badge
            HStack(spacing: 4) {
                ZStack {
                    Circle()
                        .fill(coinYellow)
                        .frame(width: 18, height: 18)
                    Text("C")
                        .font(.system(size: 10, weight: .bold))
                        .foregroundColor(.white)
                }
                Text("\(entry.pendingPoints)P \u{BC1B}\u{AE30}")
                    .font(.system(size: 13, weight: .semibold))
                    .foregroundColor(.white)
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
            .frame(maxWidth: .infinity)
            .background(
                RoundedRectangle(cornerRadius: 12)
                    .fill(primaryBlue)
            )
        }
        .padding(16)
        .widgetURL(URL(string: "caro://home"))
    }
}

// MARK: - Medium Widget with Shortcuts (2x1)

struct CaroShortcutWidgetEntryView: View {
    var entry: SimpleEntry

    private let primaryBlue = Color(red: 72/255, green: 128/255, blue: 237/255)
    private let trackGray = Color(red: 219/255, green: 220/255, blue: 223/255)
    private let coinYellow = Color(red: 254/255, green: 184/255, blue: 2/255)
    private let labelGray = Color(red: 90/255, green: 92/255, blue: 99/255)       // #5A5C63
    private let dividerGray = Color(red: 219/255, green: 220/255, blue: 223/255)

    private var distanceText: String {
        if entry.totalDistanceKm < 0.1 {
            let meters = Int(entry.totalDistanceKm * 1000)
            return "\(meters)"
        } else {
            return String(format: "%.1f", entry.totalDistanceKm)
        }
    }

    private var distanceUnit: String {
        entry.totalDistanceKm < 0.1 ? "m" : "km"
    }

    var body: some View {
        VStack(spacing: 0) {
            // Top section: distance + points + progress
            VStack(spacing: 8) {
                HStack {
                    HStack(alignment: .firstTextBaseline, spacing: 4) {
                        Text(distanceText)
                            .font(.system(size: 28, weight: .bold))
                            .foregroundColor(.black)
                        Text(distanceUnit)
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.black.opacity(0.7))
                    }

                    Spacer()

                    HStack(spacing: 4) {
                        ZStack {
                            Circle()
                                .fill(coinYellow)
                                .frame(width: 18, height: 18)
                            Text("C")
                                .font(.system(size: 10, weight: .bold))
                                .foregroundColor(.white)
                        }
                        Text("\(entry.pendingPoints)P \u{BC1B}\u{AE30}")
                            .font(.system(size: 13, weight: .semibold))
                            .foregroundColor(.white)
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 6)
                    .background(
                        RoundedRectangle(cornerRadius: 12)
                            .fill(primaryBlue)
                    )
                }

                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        RoundedRectangle(cornerRadius: 3)
                            .fill(trackGray)
                            .frame(height: 6)
                        RoundedRectangle(cornerRadius: 3)
                            .fill(primaryBlue)
                            .frame(width: max(geo.size.width * entry.progressRatio, 6), height: 6)
                    }
                }
                .frame(height: 6)
            }
            .padding(.horizontal, 20)
            .padding(.top, 14)
            .padding(.bottom, 12)

            // Divider
            dividerGray.frame(height: 1)
                .padding(.horizontal, 16)

            // Bottom section: 4 shortcut buttons
            HStack(spacing: 0) {
                shortcutButton(imageName: "bbcar", label: "\u{C6B4}\u{D589}\u{AE30}\u{B85D}", deeplink: "caro://home")
                shortcutButton(imageName: "bshopping", label: "\u{C2A4}\u{D1A0}\u{C5B4}", deeplink: "caro://store")
                shortcutButton(imageName: "bcoupon", label: "\u{CFE0}\u{D3F0}", deeplink: "caro://coin")
                shortcutButton(imageName: "bcoin", label: "\u{D3EC}\u{C778}\u{D2B8}", deeplink: "caro://coin")
            }
            .padding(.horizontal, 12)
            .padding(.vertical, 8)
        }
        .widgetURL(URL(string: "caro://home"))
    }

    private func shortcutButton(imageName: String, label: String, deeplink: String) -> some View {
        Link(destination: URL(string: deeplink)!) {
            VStack(spacing: 4) {
                Image(imageName)
                    .resizable()
                    .aspectRatio(contentMode: .fit)
                    .frame(width: 28, height: 28)
                Text(label)
                    .font(.system(size: 11, weight: .medium))
                    .foregroundColor(labelGray)
            }
            .frame(maxWidth: .infinity)
        }
    }
}

// MARK: - Widget Definitions

struct CaroWidget: Widget {
    let kind: String = "CaroWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CaroProvider()) { entry in
            CaroWidgetEntryView(entry: entry)
                .containerBackground(Color.white, for: .widget)
        }
        .configurationDisplayName("Caro")
        .description("\u{C6B4}\u{D589} \u{AC70}\u{B9AC}\u{C640} \u{D3EC}\u{C778}\u{D2B8}\u{B97C} \u{D655}\u{C778}\u{D558}\u{C138}\u{C694}")
        .supportedFamilies([.systemMedium])
        .contentMarginsDisabled()
    }
}

struct CaroSmallWidget: Widget {
    let kind: String = "CaroSmallWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CaroProvider()) { entry in
            CaroSmallWidgetEntryView(entry: entry)
                .containerBackground(Color.white, for: .widget)
        }
        .configurationDisplayName("Caro")
        .description("\u{D604}\u{C7AC} \u{C6B4}\u{D589}\u{AC70}\u{B9AC}")
        .supportedFamilies([.systemSmall])
        .contentMarginsDisabled()
    }
}

struct CaroShortcutWidget: Widget {
    let kind: String = "CaroShortcutWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: CaroProvider()) { entry in
            CaroShortcutWidgetEntryView(entry: entry)
                .containerBackground(Color.white, for: .widget)
        }
        .configurationDisplayName("Caro \u{BC14}\u{B85C}\u{AC00}\u{AE30}")
        .description("\u{C6B4}\u{D589} \u{C815}\u{BCF4}\u{C640} \u{BC14}\u{B85C}\u{AC00}\u{AE30}")
        .supportedFamilies([.systemMedium])
        .contentMarginsDisabled()
    }
}

// MARK: - Previews

#Preview(as: .systemMedium) {
    CaroWidget()
} timeline: {
    SimpleEntry(date: .now, totalDistanceKm: 153.7, pendingPoints: 153, progressRatio: 0.38)
}

#Preview(as: .systemSmall) {
    CaroSmallWidget()
} timeline: {
    SimpleEntry(date: .now, totalDistanceKm: 153.7, pendingPoints: 153, progressRatio: 0.38)
}

#Preview(as: .systemMedium) {
    CaroShortcutWidget()
} timeline: {
    SimpleEntry(date: .now, totalDistanceKm: 153.7, pendingPoints: 153, progressRatio: 0.38)
}
