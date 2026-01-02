//
//  ViewState.swift
//  stat-discute.be
//
//  Core utility for managing view states
//

import Foundation

// MARK: - View State

enum ViewState<T> {
    case idle
    case loading
    case loaded(T)
    case refreshing(T)
    case error(Error)

    var isLoading: Bool {
        if case .loading = self { return true }
        return false
    }

    var isRefreshing: Bool {
        if case .refreshing = self { return true }
        return false
    }

    var data: T? {
        switch self {
        case .loaded(let data), .refreshing(let data):
            return data
        default:
            return nil
        }
    }

    var error: Error? {
        if case .error(let error) = self { return error }
        return nil
    }
}