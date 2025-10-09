// Navigation utility for proper back button behavior like native apps
export class AppNavigation {
  private static navigationStack: string[] = [];
  private static currentPath: string = '/';

  static pushState(path: string, title?: string) {
    // Add current path to stack before navigating
    if (this.currentPath !== path) {
      this.navigationStack.push(this.currentPath);
      this.currentPath = path;
      
      // Push to browser history with app state
      window.history.pushState(
        { 
          appPath: path, 
          stackLength: this.navigationStack.length,
          isAppNavigation: true 
        }, 
        title || '', 
        window.location.href
      );
    }
  }

  static goBack(): boolean {
    if (this.navigationStack.length > 0) {
      const previousPath = this.navigationStack.pop();
      if (previousPath) {
        this.currentPath = previousPath;
        return true; // Handled by app
      }
    }
    return false; // Let browser handle (will close app)
  }

  static setupBackButtonHandler(onNavigate: (path: string) => void) {
    const handlePopState = (event: PopStateEvent) => {
      // Check if this is our app navigation
      if (event.state?.isAppNavigation) {
        event.preventDefault();
        const handled = this.goBack();
        if (handled) {
          onNavigate(this.currentPath);
        }
      }
      // If not our navigation or can't go back, let browser handle normally
    };

    window.addEventListener('popstate', handlePopState);
    
    // Return cleanup function
    return () => window.removeEventListener('popstate', handlePopState);
  }

  static getCurrentPath(): string {
    return this.currentPath;
  }

  static getStackLength(): number {
    return this.navigationStack.length;
  }

  static reset() {
    this.navigationStack = [];
    this.currentPath = '/';
  }
}
