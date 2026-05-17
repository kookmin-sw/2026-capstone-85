#import <XCTest/XCTest.h>
#import <AccountitAPI/AccountitAPI.h>
#import "AccountitAPIDTOTestSupport.h"

@interface AccountitAPICPAJobFitAnalysisListResponseTests : XCTestCase
@end

@implementation AccountitAPICPAJobFitAnalysisListResponseTests

- (void)testCopyingAndSecureCodingRoundTrip {
    [AccountitAPIDTOTestSupport assertCopyingAndSecureCodingRoundTripForDTOClass:[AccountitAPICPAJobFitAnalysisListResponse class]];
}

@end
