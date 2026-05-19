//
//  RootViewController.m
//  Accountit
//
//  Created by Jinwoo Kim on 5/17/26.
//

#import "RootViewController.h"
#import "JobsViewController.h"
#import "CompaniesViewController.h"

@interface RootViewController ()
@property (retain, nonatomic, readonly) UITabBarController *ownTabBarController;
@property (retain, nonatomic, readonly) UINavigationController *jobsNavigationController;
@property (retain, nonatomic, readonly) JobsViewController *jobsViewController;
@property (retain, nonatomic, readonly) UINavigationController *companiesNavigationController;
@property (retain, nonatomic, readonly) CompaniesViewController *companiesViewController;
@end

@implementation RootViewController
@synthesize ownTabBarController = _ownTabBarController;
@synthesize jobsNavigationController = _jobsNavigationController;
@synthesize jobsViewController = _jobsViewController;
@synthesize companiesNavigationController = _companiesNavigationController;
@synthesize companiesViewController = _companiesViewController;

- (void)dealloc {
    [_ownTabBarController release];
    [_jobsNavigationController release];
    [_jobsViewController release];
    [_companiesNavigationController release];
    [_companiesViewController release];
    [super dealloc];
}

- (void)viewDidLoad {
    [super viewDidLoad];
    
    UITabBarController *ownTabBarController = self.ownTabBarController;
    [self addChildViewController:ownTabBarController];
    [self.view addSubview:ownTabBarController.view];
    ownTabBarController.view.frame = self.view.bounds;
    ownTabBarController.view.autoresizingMask = UIViewAutoresizingFlexibleWidth | UIViewAutoresizingFlexibleHeight;
    [ownTabBarController didMoveToParentViewController:self];
}

- (UITabBarController *)ownTabBarController {
    UITabBarController *ownTabBarController = self->_ownTabBarController;
    if (ownTabBarController) return ownTabBarController;
    
    UINavigationController *jobsNavigationController = self.jobsNavigationController;
    UITab *jobsTab = [[UITab alloc] initWithTitle:@"Jobs"
                                            image:[UIImage systemImageNamed:@"person.fill"]
                                       identifier:@"Jobs"
                           viewControllerProvider:^UIViewController * _Nonnull(__kindof UITab * _Nonnull tab) {
        return jobsNavigationController;
    }];

    UINavigationController *companiesNavigationController = self.companiesNavigationController;
    UITab *companiesTab = [[UITab alloc] initWithTitle:@"Companies"
                                                 image:[UIImage systemImageNamed:@"building.2.fill"]
                                            identifier:@"Companies"
                                viewControllerProvider:^UIViewController * _Nonnull(__kindof UITab * _Nonnull tab) {
        return companiesNavigationController;
    }];

    ownTabBarController = [[UITabBarController alloc] initWithTabs:@[
        jobsTab,
        companiesTab
    ]];

    [jobsTab release];
    [companiesTab release];

    self->_ownTabBarController = ownTabBarController;
    return ownTabBarController;
}

- (UINavigationController *)jobsNavigationController {
    UINavigationController *jobsNavigationController = self->_jobsNavigationController;
    if (jobsNavigationController) return jobsNavigationController;
    
    jobsNavigationController = [[UINavigationController alloc] initWithRootViewController:self.jobsViewController];
    self->_jobsNavigationController = jobsNavigationController;
    return jobsNavigationController;
}

- (JobsViewController *)jobsViewController {
    JobsViewController *jobsViewController = self->_jobsViewController;
    if (jobsViewController) return jobsViewController;

    jobsViewController = [[JobsViewController alloc] init];
    self->_jobsViewController = jobsViewController;
    return jobsViewController;
}

- (UINavigationController *)companiesNavigationController {
    UINavigationController *companiesNavigationController = self->_companiesNavigationController;
    if (companiesNavigationController) return companiesNavigationController;
    
    companiesNavigationController = [[UINavigationController alloc] initWithRootViewController:self.companiesViewController];
    self->_companiesNavigationController = companiesNavigationController;
    return companiesNavigationController;
}

- (CompaniesViewController *)companiesViewController {
    CompaniesViewController *companiesViewController = self->_companiesViewController;
    if (companiesViewController) return companiesViewController;

    companiesViewController = [[CompaniesViewController alloc] init];
    self->_companiesViewController = companiesViewController;
    return companiesViewController;
}

@end
