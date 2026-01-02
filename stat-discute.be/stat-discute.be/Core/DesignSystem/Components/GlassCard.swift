//
//  GlassCard.swift
//  stat-discute.be
//
//  Core Component: Glass Morphism Card
//  Reference: IOS_WIREFRAME_PROFESSIONAL.md Part 3.4
//

import SwiftUI

// MARK: - Glass Card

struct GlassCard<Content: View>: View {

    let content: Content
    var padding: CGFloat
    var cornerRadius: CGFloat

    init(
        padding: CGFloat = Spacing.cardPadding,
        cornerRadius: CGFloat = CornerRadius.large,
        @ViewBuilder content: () -> Content
    ) {
        self.padding = padding
        self.cornerRadius = cornerRadius
        self.content = content()
    }

    var body: some View {
        content
            .padding(padding)
            .background(
                RoundedRectangle(cornerRadius: cornerRadius)
                    .fill(.ultraThinMaterial)
                    .overlay(
                        RoundedRectangle(cornerRadius: cornerRadius)
                            .stroke(Color.white.opacity(0.1), lineWidth: 1)
                    )
            )
    }
}

// MARK: - Solid Card (Dark Background)

struct SolidCard<Content: View>: View {

    let content: Content
    var backgroundColor: Color
    var padding: CGFloat
    var cornerRadius: CGFloat

    init(
        backgroundColor: Color = .backgroundElevated,
        padding: CGFloat = Spacing.cardPadding,
        cornerRadius: CGFloat = CornerRadius.large,
        @ViewBuilder content: () -> Content
    ) {
        self.backgroundColor = backgroundColor
        self.padding = padding
        self.cornerRadius = cornerRadius
        self.content = content()
    }

    var body: some View {
        content
            .padding(padding)
            .background(
                RoundedRectangle(cornerRadius: cornerRadius)
                    .fill(backgroundColor)
            )
    }
}

// MARK: - Tappable Card

struct TappableCard<Content: View>: View {

    let content: Content
    let action: () -> Void
    var padding: CGFloat
    var cornerRadius: CGFloat
    @State private var isPressed = false

    init(
        padding: CGFloat = Spacing.cardPadding,
        cornerRadius: CGFloat = CornerRadius.large,
        action: @escaping () -> Void,
        @ViewBuilder content: () -> Content
    ) {
        self.padding = padding
        self.cornerRadius = cornerRadius
        self.action = action
        self.content = content()
    }

    var body: some View {
        Button(action: action) {
            content
                .padding(padding)
                .background(
                    RoundedRectangle(cornerRadius: cornerRadius)
                        .fill(Color.backgroundElevated)
                )
                .scaleEffect(isPressed ? 0.98 : 1.0)
        }
        .buttonStyle(PlainButtonStyle())
        .simultaneousGesture(
            DragGesture(minimumDistance: 0)
                .onChanged { _ in
                    withAnimation(.easeInOut(duration: 0.1)) {
                        isPressed = true
                    }
                }
                .onEnded { _ in
                    withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
                        isPressed = false
                    }
                }
        )
        .sensoryFeedback(.impact(flexibility: .soft), trigger: isPressed)
    }
}

// MARK: - Accent Border Card

struct AccentBorderCard<Content: View>: View {

    let content: Content
    var accentColor: Color
    var padding: CGFloat
    var cornerRadius: CGFloat

    init(
        accentColor: Color = .accent,
        padding: CGFloat = Spacing.cardPadding,
        cornerRadius: CGFloat = CornerRadius.large,
        @ViewBuilder content: () -> Content
    ) {
        self.accentColor = accentColor
        self.padding = padding
        self.cornerRadius = cornerRadius
        self.content = content()
    }

    var body: some View {
        content
            .padding(padding)
            .background(
                RoundedRectangle(cornerRadius: cornerRadius)
                    .fill(Color.backgroundElevated)
                    .overlay(
                        RoundedRectangle(cornerRadius: cornerRadius)
                            .stroke(accentColor.opacity(0.5), lineWidth: 1)
                    )
            )
    }
}

// MARK: - Preview

#Preview("Glass Card") {
    ZStack {
        Color.appBackground.ignoresSafeArea()

        VStack(spacing: Spacing.md) {
            GlassCard {
                VStack(alignment: .leading, spacing: Spacing.xs) {
                    Text("Glass Card")
                        .font(Typography.headline)
                        .foregroundColor(.foregroundPrimary)
                    Text("With glass morphism effect")
                        .font(Typography.callout)
                        .foregroundColor(.foregroundSecondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }

            SolidCard {
                VStack(alignment: .leading, spacing: Spacing.xs) {
                    Text("Solid Card")
                        .font(Typography.headline)
                        .foregroundColor(.foregroundPrimary)
                    Text("Dark elevated background")
                        .font(Typography.callout)
                        .foregroundColor(.foregroundSecondary)
                }
                .frame(maxWidth: .infinity, alignment: .leading)
            }

            TappableCard(action: { print("Tapped") }) {
                HStack {
                    Text("Tappable Card")
                        .font(Typography.headline)
                        .foregroundColor(.foregroundPrimary)
                    Spacer()
                    Image(systemName: "chevron.right")
                        .foregroundColor(.foregroundSecondary)
                }
            }

            AccentBorderCard(accentColor: .positive) {
                Text("Accent Border Card")
                    .font(Typography.headline)
                    .foregroundColor(.foregroundPrimary)
                    .frame(maxWidth: .infinity, alignment: .leading)
            }
        }
        .padding(Spacing.screenHorizontal)
    }
}
