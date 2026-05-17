#import <XCTest/XCTest.h>
#import <AccountitAPI/AccountitAPI.h>
#import "AccountitAPIDTOTestSupport.h"

@interface AccountitAPICPACompanyAnalyticsDailyPointTests : XCTestCase
@end

@implementation AccountitAPICPACompanyAnalyticsDailyPointTests

- (void)testCopyingAndSecureCodingRoundTrip {
    [AccountitAPIDTOTestSupport assertCopyingAndSecureCodingRoundTripForDTOClass:[AccountitAPICPACompanyAnalyticsDailyPoint class]];
}

@end
