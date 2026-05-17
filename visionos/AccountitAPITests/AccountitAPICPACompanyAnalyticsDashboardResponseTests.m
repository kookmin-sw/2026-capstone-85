#import <XCTest/XCTest.h>
#import <AccountitAPI/AccountitAPI.h>
#import "AccountitAPIDTOTestSupport.h"

@interface AccountitAPICPACompanyAnalyticsDashboardResponseTests : XCTestCase
@end

@implementation AccountitAPICPACompanyAnalyticsDashboardResponseTests

- (void)testCopyingAndSecureCodingRoundTrip {
    [AccountitAPIDTOTestSupport assertCopyingAndSecureCodingRoundTripForDTOClass:[AccountitAPICPACompanyAnalyticsDashboardResponse class]];
}

@end
