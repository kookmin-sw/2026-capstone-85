//
//  AccountitApp.swift
//  Accountit
//
//  Created by Jinwoo Kim on 5/17/26.
//

import MySwiftUI

@main
struct AccountitApp: App {
    var body: some Scene {
        WindowGroup {
            RootView()
        }
    }
}

fileprivate struct RootView: UIViewControllerRepresentable {
    func makeUIViewController(context: Context) -> RootViewController {
        return RootViewController()
    }

    func updateUIViewController(_ uiViewController: RootViewController, context: Context) {
    }
}
