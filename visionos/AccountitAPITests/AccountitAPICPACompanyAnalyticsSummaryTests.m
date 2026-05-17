#import <XCTest/XCTest.h>
#import <AccountitAPI/AccountitAPI.h>
#import "AccountitAPIDTOTestSupport.h"

@interface AccountitAPICPACompanyAnalyticsSummaryTests : XCTestCase
@end

@implementation AccountitAPICPACompanyAnalyticsSummaryTests

- (void)testCopyingAndSecureCodingRoundTrip {
    [AccountitAPIDTOTestSupport assertCopyingAndSecureCodingRoundTripForDTOClass:[AccountitAPICPACompanyAnalyticsSummary class]];
}

@end
