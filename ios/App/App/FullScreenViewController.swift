import UIKit
import Capacitor

/// Custom bridge view controller that hides the status bar and home indicator
/// for a fullscreen piano app experience.
class FullScreenViewController: CAPBridgeViewController {
    override var prefersStatusBarHidden: Bool {
        return true
    }

    override var prefersHomeIndicatorAutoHidden: Bool {
        return true
    }
}
